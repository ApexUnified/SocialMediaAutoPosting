import { Subscription, SubscriptionPlan } from '../models/Subscription.js';
import Hospital from '../models/Hospital.js';

// Get all subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Subscription.find({ status: 'active' })
      .select('-__v');
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
};

// Get subscription plan by ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await Subscription.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plan' });
  }
};

// Create new subscription plan
export const createPlan = async (req, res) => {
  try {
    const plan = new Subscription(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription plan' });
  }
};

// Update subscription plan
export const updatePlan = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'name',
      'description',
      'features',
      'pricing',
      'limits',
      'status'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const plan = await Subscription.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    updates.forEach(update => plan[update] = req.body[update]);
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription plan' });
  }
};

// Subscribe hospital to a plan
export const subscribeToPlan = async (req, res) => {
  try {
    const { subscriptionId, startDate, payment } = req.body;

    // Check if subscription plan exists
    const plan = await Subscription.findById(subscriptionId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Calculate end date based on billing cycle
    const endDate = new Date(startDate);
    switch (plan.pricing.billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create subscription plan
    const subscription = new SubscriptionPlan({
      hospital: req.user.hospitalId,
      subscription: subscriptionId,
      startDate,
      endDate,
      payment: {
        ...payment,
        lastBillingDate: startDate,
        nextBillingDate: endDate
      }
    });

    await subscription.save();

    // Update hospital's subscription
    await Hospital.findByIdAndUpdate(req.user.hospitalId, {
      subscription: subscriptionId
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to plan' });
  }
};

// Get hospital's current subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await SubscriptionPlan.findOne({
      hospital: req.user.hospitalId,
      status: 'active'
    })
      .populate('subscription')
      .sort({ endDate: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription' });
  }
};

// Update subscription usage
export const updateUsage = async (req, res) => {
  try {
    const { type, amount } = req.body;

    const subscription = await SubscriptionPlan.findOne({
      hospital: req.user.hospitalId,
      status: 'active'
    }).populate('subscription');

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Check if usage is within limits
    const limit = subscription.subscription.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}`];
    if (limit && subscription.usage[type] + amount > limit) {
      return res.status(400).json({ message: 'Usage limit exceeded' });
    }

    subscription.usage[type] += amount;
    await subscription.save();

    res.json(subscription.usage);
  } catch (error) {
    res.status(500).json({ message: 'Error updating usage' });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await SubscriptionPlan.findOne({
      hospital: req.user.hospitalId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
};

// Get subscription history
export const getSubscriptionHistory = async (req, res) => {
  try {
    const subscriptions = await SubscriptionPlan.find({
      hospital: req.user.hospitalId
    })
      .populate('subscription')
      .sort({ startDate: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription history' });
  }
}; 
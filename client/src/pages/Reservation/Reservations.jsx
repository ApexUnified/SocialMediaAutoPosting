import { useEffect, useState } from 'react';
// import { reservationService } from '../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    hospitalId: '',
    date: '',
    time: '',
    service: '',
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setReservations([])
    setLoading(false)
    // try {
    //   const response = await reservationService.getAll();
    //   setReservations(response.data);
    // } catch (error) {
    //   console.error('Error fetching reservations:', error);
    //   toast.error('Failed to fetch reservations');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   await reservationService.create(formData);
    //   toast.success('Reservation created successfully');
    //   fetchReservations();
    //   setFormData({
    //     hospitalId: '',
    //     date: '',
    //     time: '',
    //     service: '',
    //   });
    // } catch (error) {
    //   console.error('Error creating reservation:', error);
    //   toast.error('Failed to create reservation');
    // }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const handleEdit = (id) => {
    console.log('Editing reservation:', id);
  };

  const handleDelete = (id) => {
    console.log('Deleting reservation:', id);
  };  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Reservations</h1>

      {/* Create Reservation Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Create New Reservation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Hospital ID"
            name="hospitalId"
            value={formData.hospitalId}
            onChange={handleChange}
            required
          />
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
          <Input
            label="Service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="primary">
            Create Reservation
          </Button>
        </form>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b text-primary">Your Reservations</h2>
        <div className="divide-y">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-primary">Hospital: {reservation.hospitalId}</h3>
                  <p className="text-gray">
                    Date: {new Date(reservation.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray">Time: {reservation.time}</p>
                  <p className="text-gray">Service: {reservation.service}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(reservation._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(reservation._id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reservations; 
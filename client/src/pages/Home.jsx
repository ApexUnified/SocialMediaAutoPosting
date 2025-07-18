import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-primary mb-6">
          Welcome to My App
        </h1>
        <p className="text-xl text-gray mb-8">
          Your one-stop solution for all your needs
        </p>
        <div className="space-x-4">
          <Button variant="primary">Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-primary">Feature 1</h3>
          <p className="text-gray">Description of the first amazing feature of your application.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-primary">Feature 2</h3>
          <p className="text-gray">Description of the second amazing feature of your application.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-primary">Feature 3</h3>
          <p className="text-gray">Description of the third amazing feature of your application.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 
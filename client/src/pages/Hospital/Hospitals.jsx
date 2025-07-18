import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    services: '',
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setHospitals([])
      // const response = await hospitalService.getAll();
      // setHospitals(response.data);
    } catch (error) {
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await hospitalService.create(formData);
      // toast.success('Hospital added successfully');
      // fetchHospitals();
      // setFormData({
      //   name: '',
      //   address: '',
      //   phone: '',
      //   email: '',
      //   services: '',
      // });
    } catch (error) {
      toast.error('Failed to add hospital');
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Hospitals</h1>

      {/* Add Hospital Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Add New Hospital</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Hospital Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Services"
            name="services"
            value={formData.services}
            onChange={handleChange}
            placeholder="Enter services separated by commas"
            required
          />
          <Button type="submit" variant="primary">
            Add Hospital
          </Button>
        </form>
      </div>

      {/* Hospitals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-primary">{hospital.name}</h3>
              <p className="text-gray mb-2">{hospital.address}</p>
              <p className="text-gray mb-2">Phone: {hospital.phone}</p>
              <p className="text-gray mb-4">Email: {hospital.email}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.services.split(',').map((service, index) => (
                    <span
                      key={index}
                      className="bg-grayLight text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {service.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button variant="secondary" className="flex-1">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hospitals; 
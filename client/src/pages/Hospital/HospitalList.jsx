import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      // TODO: Implement API call to fetch hospitals
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hospitals</h1>
        <Link
          to="/hospitals/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Hospital
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div
            key={hospital._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {hospital.name}
              </h2>
              <p className="text-gray-600 mb-4">{hospital.address}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {hospital.phoneNumber}
                </span>
                <Link
                  to={`/hospitals/${hospital._id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalList; 
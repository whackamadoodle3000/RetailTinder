import { useState, useEffect } from 'react';
// import fetch from 'node-fetch'; // This might not work in a browser environment, consider using a browser-compatible fetch polyfill
// import { Buffer } from 'buffer';

export default function DonationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedThriftStore, setSelectedThriftStore] = useState('Goodwill'); // Default thrift store
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    listAllFiles().then((output) => {
      setDonations(output);
    })
  }, [donations]);

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target) return;
      
      const image_base64 = event.target.result as string;

      const payload = {
          location: selectedThriftStore,
          image: image_base64.split("data:image/jpeg;base64,")[1]
      };
      
      try {
        const response = await fetch('https://1dd8affc97d322.lhr.life/donate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Donate Response:', data);
          // Update donations list or perform any other necessary actions
        } else {
          throw new Error('Failed to donate image');
        }
      } catch (error) {
        console.error('Failed to donate image:', error);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const listAllFiles = async () => {
    try {
      const response = await fetch('https://1dd8affc97d322.lhr.life/display_donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Donate Response:', data);
        return data;
      } else {
        throw new Error('Failed to fetch donations');
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      return [];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file);
  };

  const handleThriftStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedThriftStore(e.target.value);
  };

  return (
    <div className="px-6 pt-10 pb-20 sm:px-10 md:px-14 bg-purple-900 text-white">
      <div className="pb-3 text-2xl font-medium">Make a Donation</div>
      <div className="pb-6">Upload a photo to make a donation.</div>
      <div className="pb-6">
        <label htmlFor="photo-upload" className="block text-lg font-medium mb-2">Upload Photo:</label>
        <input type="file" id="photo-upload" accept="image/*" onChange={handleFileChange} />
        <div className="mt-2">
          <label htmlFor="thrift-store" className="block text-lg font-medium mb-2">Select Thrift Store:</label>
          <select id="thrift-store" value={selectedThriftStore} onChange={handleThriftStoreChange} className="bg-white text-black rounded-lg px-4 py-2">
            <option value="Goodwill">Goodwill</option>
            <option value="Salvation Army">Salvation Army</option>
            <option value="Savers">Savers</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button
          className={`mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handlePhotoUpload}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Submit'}
        </button>
      </div>
      <div className="mt-8">
        <div className="text-lg font-medium mb-2">Donation History</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {donations.map(donation => (
            <div key={donation.Clothes_ID}>
              <img src={donation.Image_URL} alt="Donated" className="w-full h-auto rounded-lg" />
              {/* <p className="text-white text-sm mt-2">Thrift Store: {donation.thriftStore}</p> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function CandidateDashboard() {
  const [myApps, setMyApps] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      const q = query(collection(db, "applications"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      setMyApps(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchApps();
  }, []);

  return (
    <div className="text-white p-5">
      <h2 className="text-xl font-bold">Your Applied Jobs</h2>
      {myApps.map((app, index) => (
        <div key={index} className="bg-gray-700 p-3 my-2 rounded">
          Job ID: {app.jobId} | Status: <span className="text-green-400">Successful</span>
        </div>
      ))}
    </div>
  );
}
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function EmployerDashboard() {
  const [jobTitle, setJobTitle] = useState("");

  const postJob = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "jobs"), {
      title: jobTitle,
      postedBy: "Employer Name",
      createdAt: new Date(),
    });
    alert("Job Posted!");
  };

  return (
    <form onSubmit={postJob} className="p-10 bg-gray-800 text-white rounded-lg">
      <h2 className="text-2xl mb-4">Post a New Opening</h2>
      <input 
        className="text-black p-2 rounded w-full mb-4"
        value={jobTitle} 
        onChange={(e) => setJobTitle(e.target.value)} 
        placeholder="Job Title"
      />
      <button className="bg-blue-600 px-4 py-2 rounded">Post Job</button>
    </form>
  );
}
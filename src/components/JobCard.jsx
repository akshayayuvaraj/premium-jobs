// Inside src/App.jsx or src/components/JobCard.jsx

const handleApply = async (job) => {
  // Step A: Save to Firebase first so you have a record
  try {
    await addDoc(collection(db, "applications"), {
      jobId: job.id,
      email: auth.currentUser.email,
      status: "Applied"
    });

    // Step B: Send the Email notification (PLACE THE CODE HERE)
    const templateParams = {
      email: auth.currentUser.email, // Matches {{email}} from Capture_14.PNG
      user_name: auth.currentUser.displayName || "Candidate",
      job_title: job.title,
      from_name: "Akshaya"
    };

    await emailjs.send(
      'service_nnhsy0x', // <--- service_nnhsy0x
      'template_h7e3u3b', // <--- YOUR_TEMPLATE_ID
      'UppEL37Gjo-2ICVRN', // <--- YOUR_PUBLIC_KEY
      templateParams
    );

    alert("Application Successful! Email sent.");
  } catch (error) {
    console.error("Error:", error);
  }
};
// Ensure 'export default' is right here!
export default function JobCard({ job, handleApply }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      {/* ... the rest of your JobCard code ... */}
      <button onClick={() => handleApply(job)}>Apply Now</button>
    </div>
  );
}
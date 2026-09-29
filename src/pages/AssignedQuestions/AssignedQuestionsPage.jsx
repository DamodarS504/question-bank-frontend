import DashboardLayout from '../Dashboard/DashboardLayout';
import '../Questions/Questions.css';

export default function AssignedQuestionsPage() {
  return (
    <DashboardLayout
      title="Assigned Questions"
      eyebrow="Preparation"
      allowedRoles={['EMPLOYEE']}
    >
      <div className="qb-container">
        <div className="qb-state-card qb-state-card--empty">
          <h2>Assignments are not connected yet</h2>
          <p>
            Once the employee assignments API is available, your assigned questions will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

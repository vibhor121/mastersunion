import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLead, updateLead } from '../store/slices/leadSlice';
import { fetchActivities, createActivity } from '../store/slices/activitySlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './LeadDetail.css';

const LeadDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentLead, loading } = useSelector((state) => state.leads);
  const { activities } = useSelector((state) => state.activities);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activityForm, setActivityForm] = useState({
    type: 'NOTE',
    title: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchLead(id));
    dispatch(fetchActivities({ leadId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentLead) {
      setEditForm(currentLead);
    }
  }, [currentLead]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const result = await dispatch(updateLead({ id, data: editForm }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Lead updated successfully!');
      setIsEditing(false);
      dispatch(fetchLead(id));
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createActivity({ leadId: id, activityData: activityForm }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Activity created!');
      setShowActivityModal(false);
      setActivityForm({ type: 'NOTE', title: '', description: '' });
      dispatch(fetchActivities({ leadId: id }));
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!currentLead) return <div>Lead not found</div>;

  return (
    <div className="lead-detail">
      <div className="detail-header">
        <button className="btn btn-outline" onClick={() => navigate('/leads')}>
          ← Back to Leads
        </button>
        <div className="detail-actions">
          {isEditing ? (
            <>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Lead
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h2>{currentLead.firstName} {currentLead.lastName}</h2>
            <p className="lead-subtitle">
              {currentLead.position && `${currentLead.position} at `}
              {currentLead.company}
            </p>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select
                      name="status"
                      className="select"
                      value={editForm.status || ''}
                      onChange={handleEditChange}
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Priority</label>
                    <select
                      name="priority"
                      className="select"
                      value={editForm.priority || ''}
                      onChange={handleEditChange}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Value</label>
                    <input
                      type="number"
                      name="value"
                      className="input"
                      value={editForm.value || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    className="textarea"
                    value={editForm.notes || ''}
                    onChange={handleEditChange}
                    rows="4"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="lead-info">
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`badge badge-${currentLead.status.toLowerCase()}`}>
                    {currentLead.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Priority:</span>
                  <span className={`badge badge-${currentLead.priority.toLowerCase()}`}>
                    {currentLead.priority}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Value:</span>
                  <span>${currentLead.value?.toLocaleString() || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <a href={`mailto:${currentLead.email}`}>{currentLead.email}</a>
                </div>
                {currentLead.phone && (
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <a href={`tel:${currentLead.phone}`}>{currentLead.phone}</a>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Owner:</span>
                  <span>{currentLead.owner?.firstName} {currentLead.owner?.lastName}</span>
                </div>
                {currentLead.notes && (
                  <div className="info-item">
                    <span className="info-label">Notes:</span>
                    <p>{currentLead.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card">
            <div className="card-header">
              <h3>Activity Timeline</h3>
              <button className="btn btn-secondary" onClick={() => setShowActivityModal(true)}>
                + Add Activity
              </button>
            </div>
            
            <div className="timeline">
              {activities?.activities?.map((activity) => (
                <div key={activity.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{activity.title}</strong>
                      <span className="timeline-date">
                        {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <span className={`badge badge-${activity.type.toLowerCase()}`}>
                      {activity.type}
                    </span>
                    {activity.description && <p>{activity.description}</p>}
                    <span className="timeline-user">
                      by {activity.user?.firstName} {activity.user?.lastName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Activity</h2>
              <button className="btn-close" onClick={() => setShowActivityModal(false)}>×</button>
            </div>
            <form onSubmit={handleActivitySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={activityForm.type}
                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  >
                    <option value="NOTE">Note</option>
                    <option value="CALL">Call</option>
                    <option value="MEETING">Meeting</option>
                    <option value="EMAIL">Email</option>
                    <option value="TASK">Task</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    rows="4"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowActivityModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;


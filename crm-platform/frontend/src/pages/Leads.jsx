import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchLeads, createLead, deleteLead } from '../store/slices/leadSlice';
import { toast } from 'react-toastify';
import './Leads.css';

const Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { leads, loading, pagination } = useSelector((state) => state.leads);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    page: 1,
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    value: '',
    priority: 'MEDIUM',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchLeads(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createLead(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Lead created successfully!');
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        source: '',
        value: '',
        priority: 'MEDIUM',
        notes: '',
      });
      dispatch(fetchLeads(filters));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const result = await dispatch(deleteLead(id));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Lead deleted successfully!');
        dispatch(fetchLeads(filters));
      }
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
  };

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Leads</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <input
            type="text"
            name="search"
            placeholder="Search leads..."
            className="input"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select
            name="status"
            className="select"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
          <select
            name="priority"
            className="select"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        {loading ? (
          <div className="spinner"></div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <p>No leads found</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Value</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.firstName} {lead.lastName}</strong>
                      </td>
                      <td>{lead.company || '-'}</td>
                      <td>{lead.email}</td>
                      <td>{getStatusBadge(lead.status)}</td>
                      <td>
                        <span className={`badge badge-${lead.priority.toLowerCase()}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td>${lead.value?.toLocaleString() || 0}</td>
                      <td>{lead.owner?.firstName} {lead.owner?.lastName}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => handleDelete(lead.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={pagination.page === 1}
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Lead Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Lead</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="input"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="input"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="input"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Company</label>
                    <input
                      type="text"
                      name="company"
                      className="input"
                      value={formData.company}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Position</label>
                    <input
                      type="text"
                      name="position"
                      className="input"
                      value={formData.position}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Source</label>
                    <input
                      type="text"
                      name="source"
                      className="input"
                      value={formData.source}
                      onChange={handleFormChange}
                      placeholder="e.g., Website, Referral"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Value</label>
                    <input
                      type="number"
                      name="value"
                      className="input"
                      value={formData.value}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Priority</label>
                    <select
                      name="priority"
                      className="select"
                      value={formData.priority}
                      onChange={handleFormChange}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    className="textarea"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;


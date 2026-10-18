// pages/Contact.jsx
// Contact form. Queries are saved in MongoDB (no email is sent); the team reads them on the
// SellerTribe Team page (Customer Queries), calls or emails the customer and marks them resolved.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../services/api.js';
import { CheckIcon } from '../components/Icons.jsx';
import PhotoIcon from '../components/PhotoIcon.jsx';
import siteConfig from '../data/siteConfig.js';
import photoIcons from '../data/photoIcons.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/contact.css';

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// "+91 98765-43210" -> "9876543210" (the backend does the same)
function cleanMobileNumber(value) {
  return value
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?91(?=\d{10}$)/, '')
    .replace(/^0(?=\d{10}$)/, '');
}

function validateContact(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address';
  const phone = cleanMobileNumber(values.phone);
  if (!phone) errors.phone = 'Please enter your mobile number';
  else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Please enter a valid 10-digit mobile number';
  if (values.subject.trim().length < 3) errors.subject = 'Please enter a subject (at least 3 characters)';
  if (values.message.trim().length < 10) errors.message = 'Please write a message (at least 10 characters)';
  if (values.message.length > 2000) errors.message = 'Message must be at most 2000 characters';
  return errors;
}

function Contact() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formErrors = validateContact(values);
    setErrors(formErrors);
    setServerError('');
    setSuccessMessage('');
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const data = await contactAPI.sendMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: cleanMobileNumber(values.phone),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      // Only show success after the backend confirms the message was saved
      setSuccessMessage(data.message);
      setValues(EMPTY_FORM);
    } catch (error) {
      setServerError(error.message);
      setErrors(error.errors || {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.contact)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span>
          </nav>
          <h1>Contact Us</h1>
          <p>Questions about a product, selling on the marketplace or anything else? Send us a message.</p>
        </div>
      </section>

      <div className="container page-section contact-layout">
        <aside className="contact-info">
          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">
              <PhotoIcon photo={photoIcons.haatSeller} />
            </span>
            <div>
              <h2>For sellers</h2>
              <p>Want to list your handmade products? Ask us about registering and uploading products.</p>
            </div>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">
              <PhotoIcon photo={photoIcons.craftFair} />
            </span>
            <div>
              <h2>For buyers</h2>
              <p>Have a question about a product or a seller? Let us know the product name in your message.</p>
            </div>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">
              <PhotoIcon photo={photoIcons.letterBox} />
            </span>
            <div>
              <h2>Your message</h2>
              <p>
                Messages are stored securely and read by the marketplace team.
                {siteConfig.contactEmail && (
                  <>
                    {' '}
                    You can also email us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
                  </>
                )}
              </p>
            </div>
          </div>
        </aside>

        <section className="contact-form-card" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Send a message</h2>

          {successMessage && (
            <div className="alert alert-success" role="status">
              <CheckIcon size={18} /> {successMessage}
            </div>
          )}
          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  className={`form-control ${errors.name ? 'has-error' : ''}`}
                  value={values.name}
                  onChange={handleChange}
                  maxLength={60}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`form-control ${errors.email ? 'has-error' : ''}`}
                  value={values.email}
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-phone" className="form-label">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={`form-control contact-phone-input ${errors.phone ? 'has-error' : ''}`}
                value={values.phone}
                onChange={handleChange}
                maxLength={15}
              />
              <p className="form-hint">Our team may call you on this number to help with your query.</p>
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="contact-subject" className="form-label">
                Subject <span className="required">*</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                className={`form-control ${errors.subject ? 'has-error' : ''}`}
                value={values.subject}
                onChange={handleChange}
                maxLength={120}
              />
              {errors.subject && <p className="form-error">{errors.subject}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="contact-message" className="form-label">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                className={`form-control ${errors.message ? 'has-error' : ''}`}
                value={values.message}
                onChange={handleChange}
                maxLength={2000}
              />
              <p className="form-hint">{values.message.length} / 2000 characters</p>
              {errors.message && <p className="form-error">{errors.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;

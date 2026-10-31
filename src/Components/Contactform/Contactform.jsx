import React, { useState, useEffect, useRef } from 'react'
import './Contactform.css'

const INITIAL = { name: '', email: '', phone: '', subject: '', message: '' }

const validate = (v) => {
  const e = {}
  if (!v.name.trim()) e.name = 'Please enter your name'
  if (!v.email.trim()) e.email = 'Please enter your email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = 'Enter a valid email address'
  if (v.phone.trim() && !/^[+()\-\s\d]{7,18}$/.test(v.phone.trim()))
    e.phone = 'Enter a valid phone number'
  if (!v.subject.trim()) e.subject = 'Please add a subject'
  if (v.message.trim().length < 10)
    e.message = 'Tell us a little more (at least 10 characters)'
  return e
}

const Field = ({ id, label, type = 'text', value, error, onChange, onBlur, textarea }) => {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className={`cf-field ${textarea ? 'cf-field--full' : ''} ${error ? 'is-invalid' : ''}`}>
      <Tag
        id={id}
        name={id}
        type={textarea ? undefined : type}
        rows={textarea ? 5 : undefined}
        placeholder=" "
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        autoComplete={id === 'name' ? 'name' : id === 'email' ? 'email' : id === 'phone' ? 'tel' : 'off'}
      />
      <label htmlFor={id}>{label}</label>
      <span className="cf-field__bar" />
      {error && (
        <span className="cf-field__error" id={`${id}-err`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

const Contactform = () => {
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [ref, setRef] = useState('')
  const [showTop, setShowTop] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timer.current)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...values, [name]: value }
    setValues(next)
    if (touched[name]) setErrors(validate(next))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, phone: true, subject: true, message: true })
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0]
      document.getElementById(first)?.focus()
      return
    }

    setStatus('sending')

    // ---- Replace this block with your real API call, e.g.:
    // await fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(values) })
    timer.current = setTimeout(() => {
      setRef('QT-' + Math.random().toString(36).slice(2, 8).toUpperCase())
      setStatus('sent')
    }, 1600)
  }

  const reset = () => {
    setValues(INITIAL)
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <section className="contact">
      <div className="contact__map">
        <iframe
          title="Our location"
          src="https://www.google.com/maps?q=New+York&z=10&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="contact__card">
        <div className="contact__form-wrap">
          {status === 'sent' ? (
            <div className="cf-success" role="status" aria-live="polite">
              <div className="cf-success__burst" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i} style={{ '--i': i }} />
                ))}
              </div>
              <svg className="cf-success__check" viewBox="0 0 80 80" aria-hidden="true">
                <circle className="cf-success__ring" cx="40" cy="40" r="35" />
                <path className="cf-success__tick" d="M24 41 l11 11 l21 -23" />
              </svg>
              <h3>Message sent</h3>
              <p>
                Thanks{values.name ? `, ${values.name.split(' ')[0]}` : ''}. We have received your
                request and will reply to <strong>{values.email}</strong> shortly.
              </p>
              <span className="cf-success__ref">Reference {ref}</span>
              <button type="button" className="cf-btn cf-btn--ghost" onClick={reset}>
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="contact__title">Request A Quote</h2>
              <p className="contact__sub">We will be happy to answer your questions.</p>

              <form className="cf-form" onSubmit={handleSubmit} noValidate>
                <Field id="name" label="Your Name" value={values.name}
                  error={touched.name && errors.name} onChange={handleChange} onBlur={handleBlur} />
                <Field id="email" type="email" label="Your Email" value={values.email}
                  error={touched.email && errors.email} onChange={handleChange} onBlur={handleBlur} />
                <Field id="phone" type="tel" label="Phone" value={values.phone}
                  error={touched.phone && errors.phone} onChange={handleChange} onBlur={handleBlur} />
                <Field id="subject" label="Subject" value={values.subject}
                  error={touched.subject && errors.subject} onChange={handleChange} onBlur={handleBlur} />
                <Field id="message" label="Message" textarea value={values.message}
                  error={touched.message && errors.message} onChange={handleChange} onBlur={handleBlur} />

                <button
                  type="submit"
                  className={`cf-btn ${status === 'sending' ? 'is-loading' : ''}`}
                  disabled={status === 'sending'}
                >
                  <span className="cf-btn__label">Send Message</span>
                  <span className="cf-btn__loader" aria-hidden="true" />
                  <span className="cf-btn__sr">{status === 'sending' ? 'Sending' : ''}</span>
                </button>
              </form>
            </>
          )}
        </div>

        <aside className="contact__info">
          <h3>Contact Us</h3>

          <div className="ci">
            <span className="ci__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.6" />
              </svg>
            </span>
            <div>
              <h4>Our Address</h4>
              <p>PSD Building, 2 AlBahr St, Loskia sripur, jamukara.</p>
            </div>
          </div>

          <div className="ci">
            <span className="ci__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                {[5, 12, 19].flatMap((x) =>
                  [4, 9.5, 15].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />)
                )}
                <circle cx="12" cy="20.5" r="1.7" />
              </svg>
            </span>
            <div>
              <h4>Our Phone</h4>
              <p>
                Office Telephone : <a href="tel:0029129102320">0029129102320</a>
                <br />
                Mobile : <a href="tel:000232439493">000232439493</a>
              </p>
            </div>
          </div>

          <div className="ci">
            <span className="ci__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10l9-6 9 6v10H3z" />
                <path d="M3 10l9 6 9-6" />
                <path d="M7 12V7h10v5" />
                <path d="M9.5 10h5" />
              </svg>
            </span>
            <div>
              <h4>Our Email</h4>
              <p>
                Main Email : <a href="mailto:name@website.com">name@website.com</a>
                <br />
                Inquiries : <a href="mailto:Info@orex.com">Info@orex.com</a>
              </p>
            </div>
          </div>
        </aside>
      </div>

      <button
        type="button"
        className={`contact__top ${showTop ? 'is-visible' : ''}`}
        onClick={scrollTop}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </section>
  )
}

export default Contactform
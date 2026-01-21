import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import Logo from "../assets/logo.png"; // Assuming standard logo path
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="privacy-policy-page">
      <header>
        <Link to="/" className="icon-back">
          <RiArrowRightLine />
        </Link>
        <h1>{t('privacy_policy')}</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <div className="logo-container">
        <img src={Logo} alt="Logo" />
      </div>

      <div className="content">
        {/* Section 1 */}
        <span className="section-title">{t('privacy_section1_title')}</span>
        <p className="intro-text">{t('privacy_section1_intro')}</p>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section1_1_title')}</span>
          <p>{t('privacy_section1_1_text')}</p>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section1_2_title')}</span>
          {t('privacy_section1_2_intro') && <p>{t('privacy_section1_2_intro')}</p>}
          <ul>
            {t('privacy_section1_2_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section1_3_title')}</span>
          <ul>
            {t('privacy_section1_3_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section1_4_title')}</span>
          <ul>
            {t('privacy_section1_4_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Section 2 */}
        <span className="section-title">{t('privacy_section2_title')}</span>
        <p className="intro-text">{t('privacy_section2_intro')}</p>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section2_1_title')}</span>
          <ul>
            {t('privacy_section2_1_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section2_2_title')}</span>
          <ul>
            {t('privacy_section2_2_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section2_3_title')}</span>
          <ul>
            {t('privacy_section2_3_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section2_4_title')}</span>
          <ul>
            {t('privacy_section2_4_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Section 3 */}
        <span className="section-title">{t('privacy_section3_title')}</span>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section3_1_title')}</span>
          <ul>
            {t('privacy_section3_1_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section3_2_title')}</span>
          <ul>
            {t('privacy_section3_2_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <span className="subsection-title">{t('privacy_section3_3_title')}</span>
          <ul>
            {t('privacy_section3_3_points', { returnObjects: true }).map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

      </div>

      <div className="version">
        {t('version')}
      </div>
    </div>
  );
};

export default PrivacyPolicy;

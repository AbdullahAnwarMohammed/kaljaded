import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import './AboutUs.css';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="about-us-page">
      <header>
        <Link to="/" className="icon-back">
          <RiArrowRightLine />
        </Link>
        <h1>{t('about')}</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer to balance the header */}
      </header>

      <div className="content">
        <p>
          {t('about_intro')}
        </p>

        <p>
          {t('about_commitment')}
        </p>
        <ul>
          <li>{t('about_point_original')}</li>
          <li>{t('about_point_unopened')}</li>
          <li>{t('about_point_tested')}</li>
          <li>{t('about_point_matching')}</li>
        </ul>

        <p>
          {t('about_trial_warranty')}
        </p>

        <p>
          {t('about_extended_warranty')}
        </p>

        <p>
          {t('about_conclusion')}
        </p>
      </div>

      <div className="version">
        {t('version')}
      </div>
    </div>
  );
};

export default AboutUs;

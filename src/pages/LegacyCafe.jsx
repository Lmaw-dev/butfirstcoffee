import React from 'react';
import './LegacyFrame.css';
import BackButton from '../components/BackButton';

export default function LegacyCafe() {
  return (
    <div className="legacy-frame">
      <BackButton />
      <iframe title="Legacy Cafe" src="/bfc/cafe.html" sandbox="" />
    </div>
  );
}

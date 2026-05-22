import React from 'react';
import './LegacyFrame.css';
import BackButton from '../components/BackButton';

export default function LegacyMenu() {
  return (
    <div className="legacy-frame">
      <BackButton />
      <iframe title="Legacy Menu" src="/bfc/menu.html" sandbox="" />
    </div>
  );
}

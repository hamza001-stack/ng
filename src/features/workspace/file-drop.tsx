'use client';

import { useState } from 'react';

export function FileDrop({
  id,
  name = 'image',
  accept,
  label = 'Drop a file or click to upload',
  hint = 'JPEG, PNG or WebP',
}: {
  id: string;
  name?: string;
  accept: string;
  label?: string;
  hint?: string;
}) {
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState('');

  return (
    <label className="ws-drop" htmlFor={id}>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name || '');
          if (preview) URL.revokeObjectURL(preview);
          setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
        }}
      />
      {preview ? <img src={preview} alt="" /> : null}
      <strong>{fileName || label}</strong>
      <span>{hint}</span>
    </label>
  );
}

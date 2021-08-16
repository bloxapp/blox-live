import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
// @ts-ignore
import fileUploadIcon from '../../../assets/images/file-upload.svg';

/**
 * Files selector and provider.
 * @url https://react-dropzone.js.org/
 * @url https://github.com/react-dropzone/react-dropzone
 */

const DropZoneHeader = styled.div`
  font-weight: 500;
  font-style: normal;
  font-size: 16px;
  color: #2536B8;
  text-align: center;
  margin: auto;
`;

const DropZoneSubHeader = styled.div`
  font-weight: 500;
  font-style: normal;
  font-size: 13px;
  color: #797979;
  margin: auto;
`;

const DropZoneIcon = styled.img`
  width: 40px;
  height: 30px;
  margin: auto;
`;

const baseStyle = {
  cursor: 'pointer',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignContent: 'center',
  padding: '20px',
  borderWidth: 1,
  borderRadius: 2,
  borderColor: 'rgb(185, 191, 198)',
  borderStyle: 'dashed',
  backgroundColor: 'white',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  minHeight: 150,
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

type DropZoneProps = {
  icon?: any;
  title?: string;
  subTitle?: string;
  disabled?: boolean;
  containerStyle?: any;
  onFiles?: (files: File[]) => void;
  onFileStateUpdate?: (state: { isDragActive: boolean, isDragAccept: boolean, isDragReject: boolean }) => void;
};

const DropZone = (props: DropZoneProps) => {
  const { disabled, onFileStateUpdate, onFiles, title, subTitle, icon, containerStyle } = props;

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({ disabled: Boolean(disabled) });

  const style: any = useMemo(() => ({
    ...(containerStyle ?? {}),
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  useEffect(() => {
    if (typeof onFileStateUpdate === 'function') {
      onFileStateUpdate({
        isDragActive,
        isDragAccept,
        isDragReject
      });
    }
  }, [isDragAccept, isDragReject, isDragActive]);

  useEffect(() => {
    if (acceptedFiles?.length && typeof onFiles === 'function') {
      onFiles(acceptedFiles);
    }
  }, [acceptedFiles]);

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <DropZoneIcon src={icon ?? fileUploadIcon} />
      <DropZoneHeader>{title ?? <>Drag &amp; Drop</>}</DropZoneHeader>
      <DropZoneSubHeader>{subTitle ?? 'Or select files from your computer'}</DropZoneSubHeader>
    </div>
  );
};

export default DropZone;

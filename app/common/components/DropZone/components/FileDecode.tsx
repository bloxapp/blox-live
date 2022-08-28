import React from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';
// @ts-ignore
import removeFileImage from 'assets/images/remove-file.svg';
// @ts-ignore
import fileDecodeFailureImage from 'assets/images/file-decode-failure.svg';
// @ts-ignore
import fileDecodedCheckmarkImage from 'assets/images/file-decoded-checkmark.svg';

const RemoveFileImage = styled.img`
  width: 15px;
  height: 15px;
  cursor: pointer;
`;

const FileDecodeFailureImage = styled.img`
  width: 15px;
  height: 15px;
`;

const FileDecodedImage = styled.img`
  width: 20px;
  height: 15px;
`;

export const FileDecodeProgress = () => (
  <CircularProgress style={{color: 'black', width: 15, height: 15, marginTop: 6}} />
);

export const FileDecodeFailure = () => {
  return (
    <FileDecodeFailureImage src={fileDecodeFailureImage} />
  );
};

export const FileDecodeSuccess = () => {
  return (
    <FileDecodedImage src={fileDecodedCheckmarkImage} />
  );
};

export const RemoveFileButton = (props: any) => {
  return (
    <RemoveFileImage
      src={removeFileImage}
      {...props}
    />
  );
};

export enum DECODE_STATUS {
  IN_PROGRESS,
  SUCCESS,
  FAILURE
}

type FileDecodeStatusProps = {
  status: DECODE_STATUS
};

export const FileDecode = (props: FileDecodeStatusProps) => {
  const { status } = props;
  switch (status) {
    case DECODE_STATUS.IN_PROGRESS:
      return <FileDecodeProgress />;
    case DECODE_STATUS.SUCCESS:
      return <FileDecodeSuccess />;
    case DECODE_STATUS.FAILURE:
      return <FileDecodeFailure />;
  }
};

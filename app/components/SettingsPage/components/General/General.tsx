import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import { Loader } from '../../../../common/components';
import { useInjectSaga } from '../../../../utils/injectSaga';
import saga from '../../../Organization/saga';
import Title from '../Title';
import { User, OrganizationAndValidators } from './components';

import {
  getIsLoading,
  getIsUpdateLoading,
  getOrganization,
} from '../../../Organization/selectors';
import {
  setOrganizationName,
  loadOrganization,
  updateOrganization,
} from '../../../Organization/actions';

const Wrapper = styled.div``;

const key = 'organization';

const initialProfile = {
  name: '',
  email: '',
  picture: '',
};

const General = (props: Props) => {
  useInjectSaga({ key, saga, mode: '' });
  const {
    auth,
    isLoading,
    updateUserInfoOrganization,
    loadUserOrganization,
    organization,
    isUpdateLoading,
  } = props;
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState('');
  const [orgName, setOrgName] = useState(organization.name);
  const [isEditingOrg, setEditingOrgName] = useState(false);
  const [orgJoinDate, setJoinedDate] = useState('Aug 2, 2020');
  const [numOfValidators] = useState(0);

  useEffect(() => {
    (async () => {
      await loadUserProfile();
    })();
  }, [profile]);

  useEffect(() => {
    (async () => {
      await loadUserOrganization();
      setOrgName(organization.name);
      const formatedDate = moment(organization.createdAt).format('MMMM D YYYY');
      setJoinedDate(formatedDate);
    })();
  }, [organization.id]);

  const loadUserProfile = async () => {
    await auth.getProfile((prf: Profile, err: string) => {
      if (err) {
        setError(err);
        return;
      }
      setProfile(prf);
    });
  };

  const onChange = (e: Event) => setOrgName(e.target.value);

  const onOrgEditClick = () => setEditingOrgName(true);

  const onOrgEditCancel = () => setEditingOrgName(false);

  const onOrgEditSave = () => {
    updateUserInfoOrganization(orgName);
    onOrgEditCancel();
  };

  if (error) return <div>{error}</div>;
  if (isLoading) return <Loader />;
  const orgProps = {
    name: orgName,
    joinDate: orgJoinDate,
    isEditing: isEditingOrg,
    onClick: onOrgEditClick,
    onChange,
    onSave: onOrgEditSave,
    onCancel: onOrgEditCancel,
    isLoading: isUpdateLoading,
  };

  return (
    <Wrapper>
      <Title>General Details</Title>
      <User profile={profile} />
      <OrganizationAndValidators
        orgProps={orgProps}
        numOfValidators={numOfValidators}
      />
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  isLoading: getIsLoading(state.organization),
  isUpdateLoading: getIsUpdateLoading(state.organization),
  organization: getOrganization(state.organization),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setUserOrganizationName: (orgName: string) =>
    dispatch(setOrganizationName(orgName)),
  loadUserOrganization: () => dispatch(loadOrganization()),
  updateUserInfoOrganization: (orgName: string) =>
    dispatch(updateOrganization(orgName)),
});

interface Profile {
  name: string;
  email: string;
  picture: string;
}
type Event = Record<string, any>;

type Props = {
  auth: Record<string, any>;
  isLoading: boolean;
  isUpdateLoading: boolean;
  organization: Record<string, any>;
  setUserOrganizationName: (orgName: string) => void;
  loadUserOrganization: () => void;
  updateUserInfoOrganization: (orgName: string) => void;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(General);

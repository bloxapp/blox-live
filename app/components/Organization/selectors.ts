import { State } from './types';

export const getIsLoading = (organizationState: State) => organizationState.isLoading;

export const getIsUpdateLoading = (organizationState: State) => organizationState.isUpdateLoading;

export const getOrganization = (organizationState: State) => organizationState.data;

export const getEventLogs = (organizationState: State) => organizationState.eventLogs;

export const getEventLogsLoadingStatus = (organizationState: State) => organizationState.isLoadingEventLogs;

export const getEventLogsError = (organizationState: State) => organizationState.eventLogsError;

export const getActiveValidators = (state) => state.organization.activeValidators;

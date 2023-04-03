/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import {
  EuiPage,
  EuiPageBody,
  EuiButton,
  EuiText,
  EuiTitle,
  EuiSteps,
  EuiCode,
  EuiSpacer,
  EuiImage,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiPageHeader,
} from '@elastic/eui';
import React from 'react';
import { FormattedMessage } from '@osd/i18n/react';
import { AppDependencies } from '../../types';
import securityStepsDiagram from '../../../assets/get_started.svg';
import { buildHashUrl, buildUrl } from '../utils/url-builder';
import { Action, ResourceType, RouteItem, SubAction } from '../types';
import { API_ENDPOINT_CACHE, DocLinks } from '../constants';
import { ExternalLink, ExternalLinkButton } from '../utils/display-utils';
import { TenantList } from './tenant-list/tenant-list';
import { getBreadcrumbs } from '../app-router';
import { flow, map, mapValues, partial } from 'lodash';

import { HashRouter as Router, Route, Switch, Redirect, Routes, useNavigate } from 'react-router-dom';
import { NavPanel } from './nav-panel';
import { RoleEditMappedUser } from './role-mapping/role-edit-mapped-user';
import { RoleView } from './role-view/role-view';
import { RoleEdit } from './role-edit/role-edit';
import { RoleList } from './role-list';
import { AuthView } from './auth-view/auth-view';
import { InternalUserEdit } from './internal-user-edit/internal-user-edit';
import { UserList } from './user-list';
import { SUB_URL_FOR_COMPLIANCE_SETTINGS_EDIT, SUB_URL_FOR_GENERAL_SETTINGS_EDIT } from './audit-logging/constants';
import { AuditLoggingEditSettings } from './audit-logging/audit-logging-edit-settings';
import { AuditLogging } from './audit-logging/audit-logging';
import { PermissionList } from './permission-list/permission-list';
import { CrossPageToast } from '../cross-page-toast';


const LANDING_PAGE_URL = '/getstarted';
const ROUTE_MAP: { [key: string]: RouteItem } = {
  getStarted: {
    name: 'Get Started',
    href: LANDING_PAGE_URL,
  },
  [ResourceType.roles]: {
    name: 'Roles',
    href: buildUrl(ResourceType.roles),
  },
  [ResourceType.users]: {
    name: 'Internal users',
    href: buildUrl(ResourceType.users),
  },
  [ResourceType.permissions]: {
    name: 'Permissions',
    href: buildUrl(ResourceType.permissions),
  },
  [ResourceType.tenants]: {
    name: 'Tenants',
    href: buildUrl(ResourceType.tenants),
  },
  [ResourceType.auth]: {
    name: 'Authentication',
    href: buildUrl(ResourceType.auth),
  },
  [ResourceType.auditLogging]: {
    name: 'Audit logs',
    href: buildUrl(ResourceType.auditLogging),
  },
};

const ROUTE_LIST = [
  ROUTE_MAP.getStarted,
  ROUTE_MAP[ResourceType.auth],
  ROUTE_MAP[ResourceType.roles],
  ROUTE_MAP[ResourceType.users],
  ROUTE_MAP[ResourceType.permissions],
  ROUTE_MAP[ResourceType.tenants],
  ROUTE_MAP[ResourceType.auditLogging],
];

const addBackendStep = {
  title: 'Add backends',
  children: (
    <>
      <EuiText size="s" color="subdued">
        Add authentication<EuiCode>(authc)</EuiCode>and authorization<EuiCode>(authz)</EuiCode>
        information to<EuiCode>plugins/opensearch-security/securityconfig/config.yml</EuiCode>. The
        <EuiCode>authc</EuiCode> section contains the backends to check user credentials against.
        The <EuiCode>authz</EuiCode>
        section contains any backends to fetch backend roles from. The most common example of a
        backend role is an LDAP group. <ExternalLink href={DocLinks.AuthenticationFlowDoc} />
      </EuiText>

      <EuiSpacer size="m" />

      <EuiFlexGroup gutterSize="s" wrap>
        <EuiFlexItem grow={false}>
          <ExternalLinkButton
            fill
            href={DocLinks.BackendConfigurationDoc}
            text="Create config.yml"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            data-test-subj="review-authentication-and-authorization"
            onClick={() => {
              window.location.href = buildHashUrl(ResourceType.auth);
            }}
          >
            Review authentication and authorization
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />
    </>
  ),
};

const setOfSteps = [
  {
    title: 'Create roles',
    children: (
      <>
        <EuiText size="s" color="subdued">
          Roles are reusable collections of permissions. The default roles are a great starting
          point, but you might need to create custom roles that meet your exact needs.{' '}
          <ExternalLink href={DocLinks.CreateRolesDoc} />
        </EuiText>

        <EuiSpacer size="m" />

        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="explore-existing-roles"
              fill
              onClick={() => {
                window.location.href = buildHashUrl(ResourceType.roles);
              }}
            >
              Explore existing roles
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="create-new-role"
              onClick={() => {
                window.location.href = buildHashUrl(ResourceType.roles, Action.create);
              }}
            >
              Create new role
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="l" />
      </>
    ),
  },
  {
    title: 'Map users',
    children: (
      <>
        <EuiText size="s" color="subdued">
          After a user successfully authenticates, the security plugin retrieves that user’s roles.
          You can map roles directly to users, but you can also map them to backend roles.{' '}
          <ExternalLink href={DocLinks.MapUsersToRolesDoc} />
        </EuiText>

        <EuiSpacer size="m" />

        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="map-users-to-role"
              fill
              onClick={() => {
                window.location.href = buildHashUrl(ResourceType.users);
              }}
            >
              Map users to a role
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="create-internal-user"
              onClick={() => {
                window.location.href = buildHashUrl(ResourceType.users, Action.create);
              }}
            >
              Create internal user
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    ),
  },
];

interface GetStartedProps extends AppDependencies {
  tabID: string;
}



export function GetStarted(props: GetStartedProps) {
  const setGlobalBreadcrumbs = flow(getBreadcrumbs, props.coreStart.chrome.setBreadcrumbs);
  let steps;
  if (props.config.ui.backend_configurable) {
    steps = [addBackendStep, ...setOfSteps];
  } else {
    steps = setOfSteps;
  }

  //**************************************************************
  const switchToManageTenancy = async (props: AppDependencies) => {
    // return <TenantList tabID={'Manage'} {...props} />;
    return(
      <Router basename={props.params.appBasePath}>
        <Route
          path={buildUrl(ResourceType.tenants)}
          render={() => {
            setGlobalBreadcrumbs(ResourceType.tenants);
            return <TenantList tabID={'Configure'} {...props} />;
          }}
        />
        <CrossPageToast />
      </Router>
    );
  }

  const MyFirstElement = () => {
    const navigate = useNavigate();
    return (
      <>
        <EuiButton onClick={() => navigate(ROUTE_MAP.tenants.href)}>Click me</EuiButton>
        <Route
          path={ROUTE_MAP.tenants.href}
          render={() => {
            setGlobalBreadcrumbs(ResourceType.tenants);
            return <TenantList tabID={'Manage'} {...props} />;
          }}
        />
      </>
    );
  }
  const navigate = useNavigate;
  return (
    <>
      <div className="panel-restrict-width">
        <EuiPageHeader>
          <EuiTitle size="l">
            <h1>Get started</h1>
          </EuiTitle>
          <ExternalLinkButton text="Open in new window" href={buildHashUrl()} />
        </EuiPageHeader>

        <EuiPanel paddingSize="l">
          <EuiText size="s" color="subdued">
            <p>
              The OpenSearch security plugin lets you define the API calls that users can make and
              the data they can access. The most basic configuration consists of these steps.
            </p>
          </EuiText>

          <EuiSpacer size="l" />
          {props.config.ui.backend_configurable && (
            <div className="text-center">
              <EuiImage
                size="xl"
                alt="Three steps to set up your security"
                url={securityStepsDiagram}
              />
            </div>
          )}

          <EuiSpacer size="l" />

          <EuiSteps steps={steps} />
        </EuiPanel>

        <EuiSpacer size="l" />

        <EuiPanel paddingSize="l">
          <EuiTitle size="s">
            <h3>Optional: Configure audit logs</h3>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            <p>
              <FormattedMessage
                id="audit.logs.introduction"
                defaultMessage="Audit logs let you track user access to your OpenSearch cluster and are useful for compliance purposes."
              />{' '}
              <ExternalLink href={DocLinks.AuditLogsDoc} />
            </p>
            <EuiButton
              data-test-subj="review-audit-log-configuration"
              fill
              onClick={() => {
                window.location.href = buildHashUrl(ResourceType.auditLogging);
              }}
            >
              Review Audit Log Configuration
            </EuiButton>
          </EuiText>
        </EuiPanel>

        <EuiSpacer size="l" />

        <EuiPanel paddingSize="l">
          <EuiTitle size="s">
            <h3>Optional: Purge cache</h3>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            <p>
              By default, the security plugin caches authenticated users, along with their roles and
              permissions. This option will purge cached users, roles and permissions.
            </p>
            <EuiButton
              iconType="refresh"
              fill
              onClick={() => {
                props.coreStart.http.delete(API_ENDPOINT_CACHE);
              }}
            >
              Purge cache
            </EuiButton>
          </EuiText>
        </EuiPanel>

        <EuiSpacer size="l" />

        <EuiPanel paddingSize="l">
          <EuiTitle size="s">
            <h3>Optional: Tenancy</h3>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            <p>
              By default tenancy is activated in Dashboards. Tenants in OpenSearch Dashboards are
              spaces for saving index patterns, visualizations, dashboards, and other OpenSearch
              Dashboards objects.
            </p>
              <EuiFlexGroup gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    onClick={() => {
                      // props.tabID = "Configure";
                      window.location.href = buildHashUrl(ResourceType.tenants);
                    }}
                  >
                    Manage Tenancy
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    onClick={() => {
                      // props.tabID = "Configure"
                      window.location.href = buildHashUrl(ResourceType.tenants);
                    }}
                  >
                    Configure Tenancy
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>

          </EuiText>
        </EuiPanel>

  </div>
    </>
  );
}

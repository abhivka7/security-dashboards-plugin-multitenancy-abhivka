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
  EuiPageHeader,
  EuiText,
  EuiTitle,
  EuiTabs,
  EuiTab,
  EuiCallOut,
  EuiButton,
} from '@elastic/eui';
import { Route } from 'react-router-dom';
import { ManageTab } from './manage_tab'
import { ConfigureTab1 } from './configure_tab1';
import React, { useState, useMemo, useCallback } from 'react';
import { AppDependencies } from '../../../types';
import { ExternalLink } from '../../utils/display-utils';
import { displayBoolean } from '../../utils/display-utils';
import { DocLinks } from '../../constants';
import { fetchCurrentTenant, fetchTenants, resolveTenantName, transformTenantData } from '../../utils/tenant-utils';
import { getAuthInfo, getCurrentUser } from '../../../../utils/auth-info-utils';
import { getDashboardsInfo } from '../../../../utils/dashboards-info-utils';


interface TenantListProps extends AppDependencies {
  tabID: string;
}

export function TenantList( props: TenantListProps) {

  const [isMultiTenancyEnabled, setIsMultiTenancyEnabled] = useState(props.dashboardsInfo.multitenancy_enabled);


  let tenancyDisabledWarning;

  const fetchData = async () => {
    try {
      await setIsMultiTenancyEnabled((await getDashboardsInfo(props.coreStart.http)).multitenancy_enabled);

    } catch (e) {
      console.log(e);
    }


  };

  React.useEffect(() => {
    fetchData();
  }, [props.coreStart.http, fetchData]);


  if(1){
    tenancyDisabledWarning = (
      <>
      <EuiCallOut title="Tenancy is disabled" color="warning" iconType="iInCircle">
        <p>
          Tenancy is currently disabled and users don't have access to this feature. To create, edit
          tenants you must enabled tenanc throught he configure tenancy page.
        </p>
        <EuiButton
          id="switchToConfigure"
          color="warning"
          onClick={() => onSelectedTabChanged('Configure') }
        >
          Configure tenancy
        </EuiButton>

      </EuiCallOut>
      </>
    );
  }

  let tabs = [
    {
      id: 'Manage',
      name: 'Manage',
      content: (
        <Route
          render={() => {
            return <>
              <ManageTab {...props} />
            </>

          }}
        />
      ),
    },
    {
      id: 'Configure',
      name: 'Configure',
      content: (
        <Route
          render={() => {
            return <ConfigureTab1 {...props} />;
          }}
        />
      ),
    },
  ];



  const [selectedTabId, setSelectedTabId] = useState(props.tabID);
  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
        href={tab.href}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
        prepend={tab.prepend}
        append={tab.append}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>Tenants </h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiText size="s" color="subdued">
        Tenants in OpenSearch Dashboards are spaces for saving index patterns, visualizations,
        dashboards, and other OpenSearch Dashboards objects. Use tenants to safely share your
        work with other OpenSearch Dashboards users. You can control which roles have access
        to a tenant and whether those roles have read or write access. The “Current” label
        indicates which tenant you are using now. Switch to another tenant anytime from your
        user profile, which is located on the top right of the screen. <ExternalLink href={DocLinks.TenantPermissionsDoc} />
      </EuiText>

      <EuiTabs>{renderTabs()}</EuiTabs>
      { !isMultiTenancyEnabled && (selectedTabId=='Manage') && tenancyDisabledWarning }
      {selectedTabContent}

    </>
  );


}

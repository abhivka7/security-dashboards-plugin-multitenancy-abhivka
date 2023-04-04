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
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiText,
  EuiTitle,
  EuiGlobalToastList,
  EuiSwitch,
  Query,
  EuiHorizontalRule,
  EuiFormRow,
  EuiDescribedFormGroup,
  EuiSpacer,
  EuiCheckbox,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiCodeBlock,
  EuiCallOut
} from '@elastic/eui';
import { ChangeEvent } from 'react';
import React, { ReactNode, useState, useCallback } from 'react';
import { AppDependencies } from '../../../types';
import { displayBoolean } from '../../utils/display-utils';
import { updateAuditLogging } from '../../utils/audit-logging-utils';
import { AuditLoggingSettings } from '../audit-logging/types';
import { AuthInfo } from '../../../../types';
import { updateTenancyConfig } from '../../utils/tenancy-config_util';
import {TenancyConfigSettings} from '../tenancy-config/types';
import {getAuthInfo} from '../../../../utils/auth-info-utils';
import { fetchTenants, transformTenantData } from '../../utils/tenant-utils';
import { Tenant } from '../../types';
import { showTableStatusMessage } from '../../utils/loading-spinner-utils';
import { useContextMenuState } from '../../utils/context-menu';
import { getDashboardsInfo } from '../../../../utils/dashboards-info-utils';

export function ConfigureTab(props: AppDependencies) {
  // const [isOriginalMultiTenancyEnabled, setIsOriginalMultiTenancyEnabled] = useState(props.dashboardsInfo.multitenancy_enabled);
  // const [isOriginalPrivateTenantEnabled, setIsOriginalPrivateTenantEnabled] = useState(props.dashboardsInfo.private_tenant_enabled);
  // const [dashboardsOriginalDefaultTenant, setOriginalDashboardsDefaultTenant] = useState(props.dashboardsInfo.default_tenant);

  const [isMultiTenancyEnabled, setIsMultiTenancyEnabled] = useState(props.dashboardsInfo.multitenancy_enabled);
  const [isPrivateTenantEnabled, setIsPrivateTenantEnabled] = useState(props.dashboardsInfo.private_tenant_enabled);
  const [dashboardsDefaultTenant, setDashboardsDefaultTenant] = useState(props.dashboardsInfo.default_tenant);

  // const [originalConfiguration, setOriginalConfiguration] = React.useState<TenancyConfigSettings>({});
  const [updatedConfiguration, setUpdatedConfiguration] = React.useState<TenancyConfigSettings>({});

  // const [originalTenancyConfig, setOriginalTenancyConfig] = React.useState<TenancyConfigSettings>();


  // originalConfiguration.multitenancy_enabled = isOriginalMultiTenancyEnabled;
  // originalConfiguration.private_tenant_enabled = isOriginalPrivateTenantEnabled;
  // originalConfiguration.default_tenant = dashboardsOriginalDefaultTenant;


//   const [isModalVisible, setIsModalVisible] = useState(false);
//
//   const closeModal = () => setIsModalVisible(false);
//   const showModal = () => setIsModalVisible(true);
//
//   let modal;
//
//   if (isModalVisible) {
//     modal = (
//       <EuiModal onClose={closeModal}>
//         <EuiModalHeader>
//           <EuiModalHeaderTitle>Modal title</EuiModalHeaderTitle>
//         </EuiModalHeader>
//
//         <EuiModalBody>
//           This modal has the following setup:
//           <EuiSpacer />
//           <EuiCodeBlock language="html" isCopyable>
//             {<EuiModal onClose={closeModal}>
//   <EuiModalHeader>
//     <EuiModalHeaderTitle><!-- Modal title --></EuiModalHeaderTitle>
//   </EuiModalHeader>
//
//   <EuiModalBody>
//     <!-- Modal body -->
//   </EuiModalBody>
//
//   <EuiModalFooter>
//     <EuiButton onClick={closeModal} fill>
//       Close
//     </EuiButton>
//   </EuiModalFooter>
// </EuiModal>}
//           </EuiCodeBlock>
//         </EuiModalBody>
//
//         <EuiModalFooter>
//           <EuiButton onClick={closeModal} fill>
//             Close
//           </EuiButton>
//         </EuiModalFooter>
//       </EuiModal>
//     );
//   }

  const onSwitchChangeTenancyEnabled = async () => {

    try {
      const updatedConfiguration = { ...configuration };
      updatedConfiguration.multitenancy_enabled = !isMultiTenancyEnabled;
      await updateTenancyConfig(props.coreStart.http, updatedConfiguration);

      setUpdatedConfiguration(updatedConfiguration);
    } catch (e) {
      console.error(e);
    }
  };

  // const onSwitchChangeTenancyEnabled = async (new_value:String) => {
  //
  //   try {
  //     updatedConfiguration.mulltitenancy_enabled = (new_value=="true");
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const onSwitchChangePrivateTenantEnabled = async () => {
    try {
      const updatedConfiguration = { ...configuration };
      updatedConfiguration.private_tenant_enabled = !isPrivateTenantEnabled;
      await updateTenancyConfig(props.coreStart.http, updatedConfiguration);

      setUpdatedConfiguration(updatedConfiguration);
    } catch (e) {
      console.error(e);
    }
  };

  // const onSwitchChangePrivateTenantEnabled = async (new_value:String) => {
  //   try {
  //     updatedConfiguration.private_tenant_enabled = (new_value=="true");
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const updateDefaultTenant = async (newDefaultTenant: String) => {
    try {
      // const updatedConfiguration = { ...configuration };
      updatedConfiguration.default_tenant = newDefaultTenant;
      await updateTenancyConfig(props.coreStart.http, updatedConfiguration);

      setUpdatedConfiguration(updatedConfiguration);
    } catch (e) {
      console.error(e);
    }
    };

    // const updateDefaultTenant = async (newDefaultTenant:String) => {
    //   try {
    //     updatedConfiguration.default_tenant = newDefaultTenant;
    //   } catch (e) {
    //     console.error(e);
    //   }
    // };

    // const tenancyConfigChanged = async () => {
    //   return updatedConfiguration == originalConfiguration;
    // }

    const [tenantData, setTenantData] = React.useState<Tenant[]>([]);

    React.useEffect(() => {
      const fetchData = async () => {
        try {
          setIsMultiTenancyEnabled((await getDashboardsInfo(props.coreStart.http)).multitenancy_enabled);
          setIsPrivateTenantEnabled((await getDashboardsInfo(props.coreStart.http)).private_tenant_enabled);
          setDashboardsDefaultTenant((await getDashboardsInfo(props.coreStart.http)).default_tenant);
          const rawTenantData = await fetchTenants(props.coreStart.http);
          const processedTenantData = transformTenantData(rawTenantData,
            (await getDashboardsInfo(props.coreStart.http)).private_tenant_enabled);
          setTenantData(processedTenantData);


        } catch (e) {
          // TODO: switch to better error display.
          console.error(e);
        }
      };
      fetchData();
    }, [props.coreStart.http, props.tenant, props.config.multitenancy]);

    const dropDownList = [];

    for (var count in tenantData) {
      dropDownList.push(<EuiButtonEmpty
        id="Default_tenant"
        key="Default_tenant"
        // onClick={() => updateDefaultTenant(tenantData[count].tenant)}
      >
        {tenantData[count].tenant}
      </EuiButtonEmpty>)
    }

    const [actionsMenu, closeActionsMenu] = useContextMenuState(dashboardsDefaultTenant, {}, dropDownList);


    return (
      <>
        <EuiPageHeader>
        </EuiPageHeader>
        <EuiCallOut title="Caution: You can break stuff here" color="warning" iconType="iInCircle">
          <p>
            The changes you are about to make can break large portions of OpenSearch Dashboards for users.
          </p>
        </EuiCallOut>
        <EuiSpacer size="l" />
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle size="l">
                <h3>
                  Tenancy
                </h3>
              </EuiTitle>
              <EuiHorizontalRule />
              <EuiDescribedFormGroup
                title={<p>Tenancy</p>}
                description={<p> Selecting multi-tenancy allows you to create tenants and save
                  OpenSearch Dashboards objects, such as index patterns and visualizations.
                  Tenants are useful for safely sharing your work with other Dashboards users.</p>}
                className="described-form-group"
              >
                <EuiCheckbox
                  id="ABC"
                  label={displayBoolean(isMultiTenancyEnabled)}
                  checked={isMultiTenancyEnabled}
                  // onChange={() => onSwitchChangeTenancyEnabled()}
                />
              </EuiDescribedFormGroup>

            </EuiPageContentHeaderSection>

          </EuiPageContentHeader>
        </EuiPageContent>
        <EuiSpacer size="l" />

        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle size="l">
                <h3>
                  Tenants
                </h3>
              </EuiTitle>
              <EuiHorizontalRule />
              <EuiDescribedFormGroup
                title={<p>Global Tenant</p>}
                description={<p> Global tenant is shared amaong all Dashboards users and
                  cannot be disabled. </p>}
                className="described-form-group"
              >
                <EuiText>
                  <p>
                    <small>
                      Global tenant: Enabled
                    </small>
                  </p>
                </EuiText>
              </EuiDescribedFormGroup>
              <EuiDescribedFormGroup
                title={<p>Private Tenant</p>}
                description={<p> private tenant is exclusive to each user and keeps a user's personal
                  objects private. When using the private tenant, it does not allow access to
                  objects created by the user's global tenant. </p>}
                className="described-form-group"
              >
                <EuiCheckbox
                  id="ABC"
                  label={displayBoolean(isPrivateTenantEnabled)}
                  checked={isPrivateTenantEnabled}
                  onChange={() => onSwitchChangePrivateTenantEnabled()}
                />
              </EuiDescribedFormGroup>

            </EuiPageContentHeaderSection>

          </EuiPageContentHeader>
        </EuiPageContent>
        <EuiSpacer size="l" />
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle size="l">
                <h3>
                  Default tenant
                </h3>
              </EuiTitle>
              <EuiHorizontalRule />
              <EuiDescribedFormGroup
                title={<p>Default Tenant</p>}
                description={<p> This option allows you to select the default tenant when logging
                  into Dashboards/Kibana for the first time. You can choose from any of the
                  available tenants. </p>}
                className="described-form-group"
              >
                <EuiFlexGroup>
                  <EuiFlexItem>{actionsMenu}</EuiFlexItem>
                </EuiFlexGroup>
              </EuiDescribedFormGroup>

            </EuiPageContentHeaderSection>

          </EuiPageContentHeader>
        </EuiPageContent>
      </>
    );
}


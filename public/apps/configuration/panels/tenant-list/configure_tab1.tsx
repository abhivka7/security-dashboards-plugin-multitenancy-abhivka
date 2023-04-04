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
  EuiCallOut,
  EuiBottomBar,
  EuiComboBox,
  EuiIcon,
  EuiPanel
} from '@elastic/eui';
import { ChangeEvent } from 'react';
import {  SaveChangesModalGenerator } from './save_changes_modal';
import React, { ReactNode, useState, useCallback } from 'react';
import { AppDependencies } from '../../../types';
import { displayBoolean } from '../../utils/display-utils';
import { updateAuditLogging } from '../../utils/audit-logging-utils';
import { AuditLoggingSettings } from '../audit-logging/types';
import { AuthInfo } from '../../../../types';
import { updateTenancyConfig } from '../../utils/tenancy-config_util';
import {TenancyConfigSettings} from '../tenancy-config/types';
import {getAuthInfo} from '../../../../utils/auth-info-utils';
import { fetchTenants, transformTenantData, updateTenancyConfiguration, updateTenant } from '../../utils/tenant-utils';
import { Action, Tenant } from '../../types';
import { showTableStatusMessage } from '../../utils/loading-spinner-utils';
import { useContextMenuState } from '../../utils/context-menu';
import { TenantEditModal } from './edit-modal';
import {
  createTenancyErrorToast, createTenancySuccessToast,
  createUnknownErrorToast,
  getSuccessToastMessage,
  useToastState,
} from '../../utils/toast-utils';
import { getDashboardsInfo } from '../../../../utils/dashboards-info-utils';


export function ConfigureTab1(props: AppDependencies) {

  const [isMultiTenancyEnabled, setIsMultiTenancyEnabled] = useState(props.dashboardsInfo.multitenancy_enabled);
  const [isPrivateTenantEnabled, setIsPrivateTenantEnabled] = useState(props.dashboardsInfo.private_tenant_enabled);
  const [dashboardsDefaultTenant, setDashboardsDefaultTenant] = useState(props.dashboardsInfo.default_tenant);

  const [originalConfiguration, setOriginalConfiguration] = React.useState<TenancyConfigSettings>({
    multitenancy_enabled:isMultiTenancyEnabled,
    private_tenant_enabled:isPrivateTenantEnabled,
    default_tenant:dashboardsDefaultTenant});

  const [updatedConfiguration, setUpdatedConfiguration] = React.useState<TenancyConfigSettings>({
    multitenancy_enabled:isMultiTenancyEnabled,
    private_tenant_enabled:isPrivateTenantEnabled,
    default_tenant:dashboardsDefaultTenant});

  const [showErrorWarning, setShowErrorWarning] = React.useState(false);

  const [number_of_changes, set_number_of_changes] = useState(0);

  const [toasts, addToast, removeToast] = useToastState();
  const [selectedOptions, setSelected] = useState();

  let bottomBar;
  if (number_of_changes>0) {
    bottomBar = (
      <EuiBottomBar>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText>
                  {number_of_changes} Unsaved change(s)
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton color="#FFF" size="s"
                           onClick={() => discardChangesFunction()}
                >
                  Discard changes
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton color="primary" fill size="s"
                           onClick={() => showEditModal(originalConfiguration,updatedConfiguration)}
                >
                  Save
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiBottomBar>
    );
  }

  const discardChangesFunction = async() => {
    await setUpdatedConfiguration(originalConfiguration);
    setSelected();
    await set_number_of_changes(0);
  }

  const [saveChangesModal, setSaveChangesModal] = React.useState(<></>)

  // const saveChangesFunction = async() => {
  //   await setSaveChangesModal(<SaveChangesModalGenerator(originalConfiguration,updatedConfiguration))
  //
  // }

  // const saveChangesFunction = async() => {
  //   // await setSaveChangesModal(<SaveChangesModalGenerator(originalConfiguration,updatedConfiguration))
  //   <SaveChangesModalGenerator
  //     originalTenancyConfig: {originalConfiguration}
  //     updatedTenancyConfig: {updatedConfiguration}>
  //   }

  const [editModal, setEditModal] = useState<ReactNode>(null);

  const showEditModal = (
    originalConfiguration: TenancyConfigSettings,
    updatedConfiguration: TenancyConfigSettings,
  ) => {
    setEditModal(
      <SaveChangesModalGenerator
        originalTenancyConfig={originalConfiguration}
        updatedTenancyConfig={updatedConfiguration}
        handleClose={() => setEditModal(null)}
        handleSave={async (updatedConfiguration: TenancyConfigSettings) => {
          try {
            console.log('Calling API');
            await updateTenancyConfiguration(props.coreStart.http, originalConfiguration ,updatedConfiguration);
            setEditModal(null);
            set_number_of_changes(0);
            setOriginalConfiguration(updatedConfiguration);
            setSelected();
            addToast(createTenancySuccessToast('savePassed', 'Tenancy changes applied', "Tenancy changes applied." ));
          } catch (e) {
            console.log(e);
            setEditModal(null);
            set_number_of_changes(0);
            setSelected();
            setUpdatedConfiguration(originalConfiguration)
            addToast(createTenancyErrorToast('saveFailed', 'Changes not applied', e.message ));
          }
          setEditModal(null);
        }}
      />
    );
  };

  let comboBoxOptions = [];

  const [tenantData, setTenantData] = React.useState<Tenant[]>([]);

  const fetchData = async () => {
    try {

      await setOriginalConfiguration({
        multitenancy_enabled:(await getDashboardsInfo(props.coreStart.http)).multitenancy_enabled,
        private_tenant_enabled:(await getDashboardsInfo(props.coreStart.http)).private_tenant_enabled,
        default_tenant:(await getDashboardsInfo(props.coreStart.http)).default_tenant});

      await setUpdatedConfiguration({
        multitenancy_enabled:(await getDashboardsInfo(props.coreStart.http)).multitenancy_enabled,
        private_tenant_enabled:(await getDashboardsInfo(props.coreStart.http)).private_tenant_enabled,
        default_tenant:(await getDashboardsInfo(props.coreStart.http)).default_tenant});

      const rawTenantData = await fetchTenants(props.coreStart.http);
      const processedTenantData = transformTenantData(rawTenantData,
        (await getDashboardsInfo(props.coreStart.http)).private_tenant_enabled);
      setTenantData(processedTenantData);

    } catch (e) {
      // TODO: switch to better error display.
      console.error(e);
    }
  };

  React.useEffect(() => {

    fetchData();


  }, [props.coreStart.http, props.tenant, props.config.multitenancy]);

  const onSwitchChangeTenancyEnabled = async () => {
    try {
      await setUpdatedConfiguration({
        multitenancy_enabled: !(updatedConfiguration.multitenancy_enabled),
        private_tenant_enabled: updatedConfiguration.private_tenant_enabled,
        default_tenant: updatedConfiguration.default_tenant,
      });

      if(originalConfiguration.multitenancy_enabled==updatedConfiguration.multitenancy_enabled)
      {
        await set_number_of_changes(number_of_changes + 1);
      }
      else{
        await set_number_of_changes(number_of_changes - 1);
      }
    }
    catch (e) {
        console.error(e);
      }
  };

  const onSwitchChangePrivateTenantEnabled = async () => {
    try {
      await setUpdatedConfiguration({
        multitenancy_enabled:updatedConfiguration.multitenancy_enabled,
        private_tenant_enabled:!(updatedConfiguration.private_tenant_enabled),
        default_tenant:updatedConfiguration.default_tenant})

      if(originalConfiguration.private_tenant_enabled==updatedConfiguration.private_tenant_enabled)
      {
        await set_number_of_changes(number_of_changes + 1);
      }
      else{
        await set_number_of_changes(number_of_changes - 1);
      }
      if(updatedConfiguration.default_tenant=="Private" && updatedConfiguration.private_tenant_enabled){
        await setShowErrorWarning(true);
      }
      else{
        await setShowErrorWarning(false);
      }

    } catch (e) {
      console.error(e);
    }
  };


  const updateDefaultTenant = async (newDefaultTenant: String) => {
    try {
      await setUpdatedConfiguration({
        multitenancy_enabled: updatedConfiguration.multitenancy_enabled,
        private_tenant_enabled: updatedConfiguration.private_tenant_enabled,
        default_tenant: newDefaultTenant,
      });

      if(originalConfiguration.default_tenant==updatedConfiguration.default_tenant)
      {
        await set_number_of_changes(number_of_changes + 1);
      }
      else{
        await set_number_of_changes(number_of_changes - 1);
      }
      if(updatedConfiguration.default_tenant=="Private" && !updatedConfiguration.private_tenant_enabled){
        await setShowErrorWarning(true);
      }
      else{
        await setShowErrorWarning(false);
      }

    } catch (e) {
      console.error(e);
    }

  };


  const dropDownList = [];

  for (var count in tenantData) {

    comboBoxOptions.push(
      {
        label: tenantData[count].tenant,
      }
    )

    dropDownList.push(<EuiButtonEmpty
      id="Default_tenant"
      key="Default_tenant"
      // disabled={selection.length !== 1}
      onClick={() => updateDefaultTenant(tenantData[count].tenant)}
    >
      {tenantData[count].tenant}
    </EuiButtonEmpty>)
  }

  const [options, setOptions] = useState(comboBoxOptions);

  const onChangeOptions = (selectedOptions) => {
    setSelected(selectedOptions);
    if(selectedOptions.length > 0)
    {
      updateDefaultTenant(selectedOptions[0].label);
    }
    // updateDefaultTenant(selectedOptions[0]);
  };

  const [actionsMenu, closeActionsMenu] = useContextMenuState(updatedConfiguration.default_tenant, {}, dropDownList);

  let errorCallOut =
    <EuiCallOut title="Address the highlighted areas" color="danger" iconType="iInCircle">
      <p>
        <EuiIcon type="dot" size={"s"} />   The private tenant is disabled. Select another global default tenant.
      </p>
    </EuiCallOut>
  ;

  let errorMessage =
    <EuiText color={"danger"}>
      The private tenant is disabled. Select another global default tenant.
    </EuiText>
  ;



  return (
    <>

      <EuiPageHeader>
      </EuiPageHeader>
      <EuiCallOut title="Caution: You can break stuff here" color="warning" iconType="iInCircle">
        <p>
          The changes you are about to make can break large portions of OpenSearch Dashboards for users.
        </p>
      </EuiCallOut>
      <EuiSpacer size="m" />
      {showErrorWarning && errorCallOut}
      {!showErrorWarning && bottomBar}
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
              className="described-form-group1"
            >
              <EuiCheckbox
                id="ABC"
                label={displayBoolean(updatedConfiguration.multitenancy_enabled)}
                checked={updatedConfiguration.multitenancy_enabled}
                onChange={() => onSwitchChangeTenancyEnabled()}
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
              className="described-form-group2"
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
              className="described-form-group3"
            >
              <EuiCheckbox
                id="ABCD"
                label={displayBoolean(updatedConfiguration.private_tenant_enabled)}
                checked={updatedConfiguration.private_tenant_enabled}
                onChange={() => onSwitchChangePrivateTenantEnabled()}
                disabled={!updatedConfiguration.multitenancy_enabled}
              />
            </EuiDescribedFormGroup>

          </EuiPageContentHeaderSection>

        </EuiPageContentHeader>
      </EuiPageContent>
      {saveChangesModal}
      {editModal}
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
              className="described-form-group4"
            >
              <EuiFlexGroup>
                <EuiFlexItem >
                  {/*{actionsMenu}*/}
                  <EuiComboBox
                    placeholder={updatedConfiguration.default_tenant}
                    options={comboBoxOptions}
                    selectedOptions={selectedOptions}
                    onChange={onChangeOptions}
                    singleSelection={{ asPlainText: true }}
                    isClearable={true}
                    isInvalid={showErrorWarning}
                    data-test-subj="demoComboBox"
                    isDisabled={!updatedConfiguration.multitenancy_enabled}
                    />

                  {showErrorWarning && errorMessage}
                </EuiFlexItem>

              </EuiFlexGroup>
            </EuiDescribedFormGroup>

          </EuiPageContentHeaderSection>

        </EuiPageContentHeader>
        <EuiGlobalToastList toasts={toasts} toastLifeTimeMs={3000} dismissToast={removeToast} />
      </EuiPageContent>
    </>
  );
}


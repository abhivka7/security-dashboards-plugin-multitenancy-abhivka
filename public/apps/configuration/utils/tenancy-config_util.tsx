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

import { HttpStart } from 'opensearch-dashboards/public';
import { AuditLoggingSettings } from '../panels/audit-logging/types';
import { API_ENDPOINT_AUDITLOGGING, API_ENDPOINT_TENANCYCONFIG} from '../constants';
import { httpGet, httpPut, httpPost } from './request-utils';
import {AuthInfo} from '../../../types';
import { TenancyConfigSettings} from '../panels/tenancy-config/types';

export async function updateTenancyConfig(http: HttpStart, updateObject: TenancyConfigSettings) {
  return await httpPost(http, API_ENDPOINT_TENANCYCONFIG , updateObject);
}

export async function updateTenancyConfig_tenancy_enabled(http: HttpStart, updateObject: TenancyConfigSettings) {
  return await httpPut(http, API_ENDPOINT_TENANCYCONFIG, updateObject);
}

export async function getTenancyConfig(http: HttpStart): Promise<TenancyConfigSettings> {
  const rawConfiguration = await httpGet<any>(http, API_ENDPOINT_TENANCYCONFIG);
  return rawConfiguration;
}

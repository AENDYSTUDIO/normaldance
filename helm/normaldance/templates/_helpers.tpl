
{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "normaldance.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "normaldance.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "normaldance.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "normaldance.labels" -}}
helm.sh/chart: {{ include "normaldance.chart" . }}
{{ include "normaldance.selectorLabels" . }}
{{- if .Chart.AppVersion -}}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "normaldance.selectorLabels" -}}
app.kubernetes.io/name: {{ include "normaldance.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "normaldance.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "normaldance.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Create the name of the secret to use
*/}}
{{- define "normaldance.secretName" -}}
{{- default (include "normaldance.fullname" .) .Values.secret.name -}}
{{- end -}}

{{/*
Create the name of the configmap to use
*/}}
{{- define "normaldance.configMapName" -}}
{{- default (include "normaldance.fullname" .) .Values.configMap.name -}}
{{- end -}}

{{/*
Create the name of the persistent volume claim to use
*/}}
{{- define "normaldance.pvcName" -}}
{{- default (include "normaldance.fullname" .) .Values.pvc.name -}}
{{- end -}}

{{/*
Create the name of the service to use
*/}}
{{- define "normaldance.serviceName" -}}
{{- default (include "normaldance.fullname" .) .Values.service.name -}}
{{- end -}}

{{/*
Create the name of the ingress to use
*/}}
{{- define "normaldance.ingressName" -}}
{{- default (include "normaldance.fullname" .) .Values.ingress.name -}}
{{- end -}}

{{/*
Create the name of the deployment to use
*/}}
{{- define "normaldance.deploymentName" -}}
{{- default (include "normaldance.fullname" .) .Values.deployment.name -}}
{{- end -}}

{{/*
Create the name of the statefulset to use
*/}}
{{- define "normaldance.statefulSetName" -}}
{{- default (include "normaldance.fullname" .) .Values.statefulSet.name -}}
{{- end -}}

{{/*
Create the name of the daemonset to use
*/}}
{{- define "normaldance.daemonSetName" -}}
{{- default (include "normaldance.fullname" .) .Values.daemonSet.name -}}
{{- end -}}

{{/*
Create the name of the job to use
*/}}
{{- define "normaldance.jobName" -}}
{{- default (include "normaldance.fullname" .) .Values.job.name -}}
{{- end -}}

{{/*
Create the name of the cronjob to use
*/}}
{{- define "normaldance.cronJobName" -}}
{{- default (include "normaldance.fullname" .) .Values.cronJob.name -}}
{{- end -}}

{{/*
Create the name of the pod disruption budget to use
*/}}
{{- define "normaldance.podDisruptionBudgetName" -}}
{{- default (include "normaldance.fullname" .) .Values.podDisruptionBudget.name -}}
{{- end -}}

{{/*
Create the name of the network policy to use
*/}}
{{- define "normaldance.networkPolicyName" -}}
{{- default (include "normaldance.fullname" .) .Values.networkPolicy.name -}}
{{- end -}}

{{/*
Create the name of the resource quota to use
*/}}
{{- define "normaldance.resourceQuotaName" -}}
{{- default (include "normaldance.fullname" .) .Values.resourceQuota.name -}}
{{- end -}}

{{/*
Create the name of the limit range to use
*/}}
{{- define "normaldance.limitRangeName" -}}
{{- default (include "normaldance.fullname" .) .Values.limitRange.name -}}
{{- end -}}

{{/*
Create the name of the pod security policy to use
*/}}
{{- define "normaldance.podSecurityPolicyName" -}}
{{- default (include "normaldance.fullname" .) .Values.podSecurityPolicy.name -}}
{{- end -}}

{{/*
Create the name of the role to use
*/}}
{{- define "normaldance.roleName" -}}
{{- default (include "normaldance.fullname" .) .Values.role.name -}}
{{- end -}}

{{/*
Create the name of the role binding to use
*/}}
{{- define "normaldance.roleBindingName" -}}
{{- default (include "normaldance.fullname" .) .Values.roleBinding.name -}}
{{- end -}}

{{/*
Create the name of the cluster role to use
*/}}
{{- define "normaldance.clusterRoleName" -}}
{{- default (include "normaldance.fullname" .) .Values.clusterRole.name -}}
{{- end -}}

{{/*
Create the name of the cluster role binding to use
*/}}
{{- define "normaldance.clusterRoleBindingName" -}}
{{- default (include "normaldance.fullname" .) .Values.clusterRoleBinding.name -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "normaldance.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "normaldance.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Create the name of the secret to use
*/}}
{{- define "normaldance.secretName" -}}
{{- default (include "normaldance.fullname" .) .Values.secret.name -}}
{{- end -}}

{{/*
Create the name of the configmap to use
*/}}
{{- define "normaldance.configMapName" -}}
{{- default (include "normaldance.fullname" .) .Values.configMap.name -}}
{{- end -}}

{{/*
Create the name of the persistent volume claim to use
*/}}
{{- define "normaldance.pvcName" -}}
{{- default (include "normaldance.fullname" .) .Values.pvc.name -}}
{{- end -}}

{{/*
Create the name of the service to use
*/}}
{{- define "normaldance.serviceName" -}}
{{- default (include "normaldance.fullname" .) .Values.service.name -}}
{{- end -}}

{{/*
Create the name of the ingress to use
*/}}
{{- define "normaldance.ingressName" -}}
{{- default (include "normaldance.fullname" .) .Values.ingress.name -}}
{{- end -}}

{{/*
Create the name of the deployment to use
*/}}
{{- define "normaldance.deploymentName" -}}
{{- default (include "normaldance.fullname" .) .Values.deployment.name -}}
{{- end -}}

{{/*
Create the name of the statefulset to use
*/}}
{{- define "normaldance.statefulSetName" -}}
{{- default (include "normaldance.fullname" .) .Values.statefulSet.name -}}
{{- end -}}

{{/*
Create the name of the daemonset to use
*/}}
{{- define "normaldance.daemonSetName" -}}
{{- default (include "normaldance.fullname" .) .Values.daemonSet.name -}}
{{- end -}}

{{/*
Create the name of the job to use
*/}}
{{- define "normaldance.jobName" -}}
{{- default (include "normaldance.fullname" .) .Values.job.name -}}
{{- end -}}

{{/*
Create the name of the cronjob to use
*/}}
{{- define "normaldance.cronJobName" -}}
{{- default (include "normaldance.fullname" .) .Values.cronJob.name -}}
{{- end -}}

{{/*
Create the name of the pod disruption budget to use
*/}}
{{- define "normaldance.podDisruptionBudgetName" -}}
{{- default (include "normaldance.fullname" .) .Values.podDisruptionBudget.name -}}
{{- end -}}

{{/*
Create the name of the network policy to use
*/}}
{{- define "normaldance.networkPolicyName" -}}
{{- default (include "normaldance.fullname" .) .Values.networkPolicy.name -}}
{{- end -}}

{{/*
Create the name of the resource quota to use
*/}}
{{- define "normaldance.resourceQuotaName" -}}
{{- default (include "normaldance.fullname" .) .Values.resourceQuota.name -}}
{{- end -}}

{{/*
Create the name of the limit range to use
*/}}
{{- define "normaldance.limitRangeName" -}}
{{- default (include "normaldance.fullname" .) .Values.limitRange.name -}}
{{- end -}}

{{/*
Create the name of the pod security policy to use
*/}}
{{- define "normaldance.podSecurityPolicyName" -}}
{{- default (include "normaldance.fullname" .) .Values.podSecurityPolicy.name -}}
{{- end -}}

{{/*
Create the name of the role to use
*/}}
{{- define "normaldance.roleName" -}}
{{- default (include "normaldance.fullname" .) .Values.role.name -}}
{{- end -}}

{{/*
Create the name of the role binding to use
*/}}
{{- define "normaldance.roleBindingName" -}}
{{- default (include "normaldance.fullname" .) .Values.roleBinding.name -}}
{{- end -}}

{{/*
Create the name of the cluster role to use
*/}}
{{- define "normaldance.clusterRoleName" -}}
{{- default (include "normaldance.fullname" .) .Values.clusterRole.name -}}
{{- end -}}

{{/*
Create the name of the cluster role binding to use
*/}}
{{- define "normaldance.clusterRoleBindingName" -}}
{{- default (include "normaldance.fullname" .) .Values.clusterRoleBinding.name -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "normaldance.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "normaldance.fullname
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import yaml from 'js-yaml';

export default class Kubectx {
  private _kubeConfig: any | undefined;

  get kubeconfigPath() {
    return path.resolve(os.homedir(), '.kube/config');
  }

  get kubeConfig() {
    if (this._kubeConfig) return this._kubeConfig;
    this._kubeConfig = yaml.safeLoad(
      fs.readFileSync(this.kubeconfigPath).toString()
    ) as any;
    return this._kubeConfig;
  }

  get activeContext(): any | undefined {
    return (this.kubeConfig?.contexts || []).find(
      (context: any) => context.name === this.kubeConfig?.['current-context']
    )?.context;
  }

  get activeCluster(): any | undefined {
    return (this.kubeConfig?.clusters || []).find(
      (cluster: any) => cluster.name === this.activeContext.cluster
    );
  }
}

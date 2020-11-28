import Kubectx from './kubectx';

export default class Proxy {
  private kubectx = new Kubectx();

  private rancherUrl: string | undefined;

  private clusterId: string | undefined;

  private ns: string | undefined;

  static RANCHER_CLUSTER_REGEX = /^https?:\/\/[^/]+\/k8s\/clusters\/[^/]+$/g;

  static RANCHER_URL_REGEX = /^https?:\/\/[^/]+/g;

  static CLUSTER_ID_REGEX = /[^/]+$/g;

  constructor(rancherUrl?: string, clusterId?: string, ns?: string) {
    const server = this.kubectx.activeCluster?.cluster?.server;
    this.rancherUrl = rancherUrl || this.guessRancherUrl(server);
    this.clusterId = clusterId || this.guessClusterId(server);
    this.ns = ns || this.kubectx.activeContext?.namespace;
  }

  guessRancherUrl(server: string = ''): string | undefined {
    if (![...server.matchAll(Proxy.RANCHER_CLUSTER_REGEX)].length) {
      return undefined;
    }
    return [...server.matchAll(Proxy.RANCHER_URL_REGEX)]?.[0]?.[0] || undefined;
  }

  guessClusterId(server: string = ''): string | undefined {
    if (![...server.matchAll(Proxy.RANCHER_CLUSTER_REGEX)].length) {
      return undefined;
    }
    return [...server.matchAll(Proxy.CLUSTER_ID_REGEX)]?.[0]?.[0] || undefined;
  }

  calculate(service: string, port = 'http', ns?: string): string | undefined {
    if (!this.rancherUrl || !this.clusterId || (!this.ns && !ns)) {
      return undefined;
    }
    return `${this.rancherUrl}/k8s/clusters/${
      this.clusterId
    }/api/v1/namespaces/${ns || this.ns}/services/${service}:${port}/proxy`;
  }
}

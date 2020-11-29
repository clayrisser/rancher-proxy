import Kubectx from '~/kubectx';
import kubectl from '~/kubectl';

export default class Proxy {
  private kubectx = new Kubectx();

  rancherUrl: string | undefined;

  clusterId: string | undefined;

  ns: string | undefined;

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

  async calculate(
    service: string,
    port?: string,
    ns?: string
  ): Promise<string | undefined> {
    const svc = await this.getSvc(service);
    if (!svc) return undefined;
    const ports: Set<string> = (svc?.spec?.ports || []).reduce(
      (ports: Set<string>, portObj: any) => {
        if (portObj.name) ports.add(portObj.name.toString());
        if (portObj.port) ports.add(portObj.port.toString());
        return ports;
      },
      new Set()
    );
    if (port) {
      if (!ports.has(port)) throw new Error(`port ${port} not exposed`);
    } else {
      if (!ports.size) throw new Error('no ports are exposed');
      port = [...ports]?.[0];
    }
    if (!this.rancherUrl || !this.clusterId || (!this.ns && !ns)) {
      return undefined;
    }
    return `${this.rancherUrl}/k8s/clusters/${
      this.clusterId
    }/api/v1/namespaces/${ns || this.ns}/services/${service}:${port}/proxy`;
  }

  async getSvc(name: string, ns?: string): Promise<any | undefined> {
    if (!this.ns && !ns) return undefined;
    try {
      const result = await kubectl(['get', 'svc', name, '-n', ns || this.ns!]);
      return result;
    } catch (err) {}
  }
}

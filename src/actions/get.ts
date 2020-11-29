import Proxy from '~/proxy';

export default async function get({
  clusterId,
  noFail,
  ns,
  port,
  rancherUrl,
  serviceName
}: GetOptions): Promise<string | undefined> {
  try {
    const proxy = new Proxy(rancherUrl, clusterId, ns);
    const url = await proxy.calculate(serviceName, port);
    if (!url && !noFail) {
      throw new Error(
        `unable to find service ${serviceName} in namespace ${proxy.ns} for cluster ${proxy.clusterId} at ${proxy.rancherUrl}`
      );
    }
    return url;
  } catch (err) {
    if (!noFail) throw err;
  }
}

export interface GetOptions {
  clusterId?: string;
  noFail?: boolean;
  ns?: string;
  port?: string;
  rancherUrl?: string;
  serviceName: string;
}

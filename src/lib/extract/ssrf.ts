import { z } from "zod";
import dns from "node:dns/promises";
import net from "node:net";

const UrlSchema = z.string().url().max(2048);

function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;

    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;

    // AWS/GCP metadata
    if (ip === "169.254.169.254") return true;
  }

  // IPv6 checks (block common private/link-local ranges)
  if (net.isIPv6(ip)) {
    const lowered = ip.toLowerCase();
    if (lowered === "::1") return true; // loopback
    if (lowered.startsWith("fc") || lowered.startsWith("fd")) return true; // unique local
    if (lowered.startsWith("fe80")) return true; // link-local
  }

  return false;
}

export async function validatePublicHttpUrl(raw: string): Promise<string> {
  const urlStr = UrlSchema.parse(raw);
  const url = new URL(urlStr);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http/https URLs are allowed.");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Localhost and .local domains are not allowed.");
  }

  // Resolve DNS and block private IPs
  const addrs = await dns.lookup(hostname, { all: true });
  if (!addrs.length) throw new Error("DNS resolution failed.");

  for (const addr of addrs) {
    if (isPrivateIp(addr.address)) {
      throw new Error("Private or local network targets are not allowed.");
    }
  }

  return url.toString();
}

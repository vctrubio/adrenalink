# Troubleshooting Docker & Supabase on SIM Routers (GigaCube/LTE/5G)

If you are getting `net/http: TLS handshake timeout` when running `supabase start` or `docker pull`, it is likely due to the **MTU (Maximum Transmission Unit)** settings of your mobile router (like the Vodafone GigaCube).

Mobile networks use "encapsulation" which makes the maximum allowed packet size smaller than the standard 1500 bytes. When Docker tries to perform a secure TLS handshake, the packets are too large and the router drops them.

## Solutions

### 1. The "Silver Bullet": Cloudflare WARP (Recommended)
The easiest way to fix this without changing system settings is to install **Cloudflare WARP** (1.1.1.1).
- **Why:** It creates a WireGuard tunnel that automatically handles packet fragmentation and MTU adjustments for you.
- **Action:** Download and turn on WARP, then try `supabase start` again.

### 2. Manual MTU Adjustment (The Technical Fix)
If you don't want to use a VPN/WARP, you must manually lower the MTU on both your Mac and the Docker Engine.

#### Step A: Lower Mac Wi-Fi MTU
Run this in your terminal to set the Wi-Fi (`en0`) MTU to a safe mobile-friendly size:
```bash
sudo networksetup -setMTU en0 1200
```
*Note: You can reset this later with `sudo networksetup -setMTU en0 1500`.*

#### Step B: Lower Docker Engine MTU
1. Open **Docker Desktop Settings**.
2. Go to **Docker Engine**.
3. Add `"mtu": 1200` to the JSON configuration:
   ```json
   {
     "builder": { ... },
     "experimental": false,
     "mtu": 1200
   }
   ```
4. Click **Apply & Restart**.

### 3. DNS Optimization
Sometimes SIM routers hijack DNS requests.
1. Go to **System Settings** -> **Wi-Fi** -> **Details** -> **DNS**.
2. Add `1.1.1.1` and `8.8.8.8` to the list of DNS servers.

### 4. Direct Image Pulling (Bypassing Supabase CLI)
If `supabase start` times out, try pulling the largest images one-by-one to give them more time:
```bash
docker pull public.ecr.aws/supabase/postgres:17.6.1.064
```

## Why `curl` works but `docker` fails?
Your Mac's `curl` often works because it's running directly on the OS which might be handling the fragmentation better. Docker runs inside a Virtual Machine (Linux) with its own virtual network bridge, which is much more sensitive to MTU mismatches.

# Engine Book deployment

The production site is `https://book.azoraengine.org`. DNS must resolve to
`152.239.116.142` before provisioning it.

Run this repository's setup script as a VPS administrator:

```sh
sudo bash deploy/bootstrap-vps.sh
```

This creates `/var/www/book.azoraengine.org/html`, enables the nginx site, and
obtains an HTTPS certificate using the existing Let's Encrypt account. Rerunning
the script preserves an existing nginx configuration and certificate setup.

Generate a dedicated SSH key and install its public key for `azora-deploy` with
this prefix in `~azora-deploy/.ssh/authorized_keys`:

```text
command="/usr/bin/rrsync -wo /var/www/book.azoraengine.org",restrict
```

Store the matching private key as the repository Actions secret
`DEPLOY_SSH_PRIVATE_KEY`. The workflow uploads `dist/` into the restricted key's
relative `html/` directory on every push to `main` or manual deployment run.

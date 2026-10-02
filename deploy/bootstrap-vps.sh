#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo 'Run this script as root or with sudo.' >&2
    exit 1
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
site_config=/etc/nginx/sites-available/book.azoraengine.org
test -x /usr/bin/rrsync
command -v certbot >/dev/null
install -d -o root -g root -m 0755 /var/www/book.azoraengine.org
install -d -o azora-deploy -g www-data -m 2775 /var/www/book.azoraengine.org/html

# Preserve an existing HTTPS configuration when the setup script is rerun.
if [[ ! -f ${site_config} ]]; then
    install -o root -g root -m 0644 "${script_dir}/nginx.conf" "${site_config}"
fi
ln -sfn "${site_config}" /etc/nginx/sites-enabled/book.azoraengine.org
nginx -t
systemctl reload nginx
certbot --nginx --non-interactive --agree-tos --redirect -d book.azoraengine.org

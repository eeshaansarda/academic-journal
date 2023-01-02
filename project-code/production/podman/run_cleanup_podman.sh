echo "Removing Pod"
podman pod kill ecstatic_bohr
podman pod rm ecstatic_bohr

echo "Deleting Storage"
podman storage rm mongostorage
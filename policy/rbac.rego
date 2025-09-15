package normaldance.authz

default allow = false

allow {
  input.action == "read"
  startswith(input.path, "secret/normaldance/keys/")
  input.user.roles[_] == "key-user"
}

allow {
  input.action == "read"
  not startswith(input.path, "secret/normaldance/keys/")
}


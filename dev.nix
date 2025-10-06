    { pkgs, ... }:
    {
      services.docker.enable = true;
      # You can also add other packages or configurations here
      # packages = [ pkgs.go pkgs.air ];
    }
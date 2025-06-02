module "vpc" {
  source = "./modules/vpc"
}

module "securitygroups" {
  source = "./modules/securitygroups"
  vpc_id = module.vpc.vpc_id
}

module "alb" {
  source = "./modules/alb"
  vpc_id = module.vpc.vpc_id
  subnets = module.vpc.public_subnets
  alb_sg = module.securitygroups.alb_sg_id
}

module "ec2" {
  source = "./modules/ec2"
  vpc_id = module.vpc.vpc_id
  subnets = module.vpc.private_subnets
  ec2_sg = module.securitygroups.ec2_sg_id
  user_data  = filebase64("startup.sh")
}

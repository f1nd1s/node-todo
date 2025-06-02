variable "vpc_id" {}
variable "subnets" { type = list(string) }
variable "ec2_sg" {}
variable "user_data" {}

resource "aws_launch_template" "lt" {
  name_prefix   = "todo-launch-template-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  user_data     = var.user_data

  network_interfaces {
    security_groups = [var.ec2_sg]
    subnet_id       = element(var.subnets, 0)
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "asg" {
  name                      = "todo-asg"
  max_size                  = 2
  min_size                  = 1
  desired_capacity          = 1
  vpc_zone_identifier       = var.subnets
  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }
  health_check_type         = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "todo-ec2-instance"
    propagate_at_launch = true
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

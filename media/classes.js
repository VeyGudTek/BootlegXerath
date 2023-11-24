class Cursor{
    constructor(x, y){
      this.x = x
      this.y = y
    }
  }

class Projectile extends Cursor{
  constructor(x, y, x_vel, y_vel, damage, size, color){
    super(x, y)
    this.damage = damage
    this.x_vel = x_vel
    this.y_vel = y_vel
    this.size = size
    this.color = color
  }

  update_position(){
    this.x += this.x_vel
    this.y += this.y_vel
  }

  collided_with(target){
    let dist = sqrt((target.x - this.x)**2 + (target.y - this.y)**2)

    if(target.size/2 + this.size/2 > dist){
      return true
    } else{
      return false
    }
  }

  draw(){
    fill(this.color)
    noStroke()
    circle(this.x, this.y, this.size)
  }
}

class Enemy extends Cursor{
  constructor(x, y, health, cooldown, size, speed, projectile_speed, projectile_size, projectile_damage, color){
    super(x, y)
    this.timer = 0
    this.health = health
    this.max_health = health
    this.cooldown = cooldown
    this.size = size
    this.speed = speed
    this.projectile_speed = projectile_speed
    this.projectile_size = projectile_size
    this.projectile_damage = projectile_damage
    this.color = color
  }

  shoot(player){
    if (this.timer <= 0){
      let angle = Math.atan2(player.x - this.x, this.y - player.y) - Math.PI/2
      let y_vel = this.projectile_speed * Math.sin(angle)
      let x_vel = this.projectile_speed * Math.cos(angle)

      let projectile = new Projectile(this.x, this.y, x_vel, y_vel, this.projectile_damage, this.projectile_size, "red")
      this.timer = this.cooldown
      return projectile
    }
  }

  update_cooldowns(){
    if (this.timer > 0)
    {
      this.timer -= 1
    }
  }

  move_to(player){
    let dist = sqrt((player.x - this.x)**2 + (player.y - this.y)**2)

    if (dist > 250){
      let angle = Math.atan2(player.x - this.x, this.y - player.y) - Math.PI/2
      
      if (dist > this.speed){
        this.y += this.speed * Math.sin(angle)
        this.x += this.speed * Math.cos(angle)
      }
    }
  }

  draw(){
    noStroke()
    fill("grey")
    rect(this.x - this.size, this.y - this.size - 5, this.size * 2, 7)
    fill(this.color)
    rect(this.x - this.size, this.y - this.size - 5, this.size * 2 * (this.health/this.max_health), 7)
    fill(this.color)
    circle(this.x, this.y, this.size)
  }
}

class Player extends Cursor{
    constructor(x, y){
      super(x, y)
      this.health = 50
      this.mana = 50
      this.speed = 10
      this.size = 30
      this.q_cooldown = 0
      this.w_cooldown = 0
      this.e_cooldown = 0
      this.charging = false
      this.q_length = 200
    }


    q_down(){
      if(this.mana >= 15 && this.q_cooldown <= 0 && !this.charging){
        this.charging = true
        this.mana -= 15
        this.q_cooldown = 120
      }
    }

    q_up(enemy_list){
      if(this.charging){
        let angle = Math.atan2(mouseX - this.x, this.y - mouseY) - Math.PI/2
        let new_x = Math.cos(angle) * this.q_length + this.x
        let new_y = Math.sin(angle) * this.q_length + this.y

        let x_diff = mouseX - this.x
        let y_diff = mouseY - this.y
        let slope
        if (x_diff != 0 && y_diff != 0){
          slope = y_diff/x_diff
          let offsets = findCircleLineIntersections(50, 0, 0, -slope, 0)
          let long_upper_offset_y = offsets[0]
          let long_lower_offset_y = offsets[1]
          let long_upper_offset_x = long_upper_offset_y * -slope
          let long_lower_offset_x = long_lower_offset_y * -slope

          let short_lower_offset_x, short_lower_offset_y, short_upper_offset_x, short_upper_offset_y
          if(new_y > this.y){
            short_upper_offset_y = new_y - this.y
            short_upper_offset_x = new_x - this.x
            short_lower_offset_y = 0
            short_lower_offset_x = 0
          } else {
            short_upper_offset_y = 0
            short_upper_offset_x = 0
            short_lower_offset_y = new_y - this.y
            short_lower_offset_x = new_x - this.x;
          }
          
          enemy_list.forEach((enemy) => {
            if(check_overlap_diagonal(this.x, this.y, long_upper_offset_x, long_upper_offset_y, long_lower_offset_x, long_lower_offset_y, short_lower_offset_x, short_lower_offset_y, short_upper_offset_x, short_upper_offset_y, slope, enemy)){
              enemy.health -= 90
            }
          })
          
        } else {
          //Perpendicular hitbox
          enemy_list.forEach((enemy) => {
            let inbound = true
            if (x_diff == 0){
              if (y_diff > 0){
                if(!area_in_bound_perpendicular(this.x - 50, this.x + 50, this.y + this.q_length, this.y, enemy)){
                  inbound = false
                }
              }else{
                if(!area_in_bound_perpendicular(this.x - 50, this.x + 50, this.y, this.y - this.q_length, enemy)){
                  inbound = false
                }
              }
            }else{
              if(x_diff > 0){
                if(!area_in_bound_perpendicular(this.x, this.x + this.q_length, this.y + 50, this.y - 50, enemy)){
                  inbound = false
                }
              }else{
                if(!area_in_bound_perpendicular(this.x - this.q_length, this.x, this.y + 50, this.y - 50, enemy)){
                  inbound = false
                }
              }
            }
            if (inbound){
              enemy.health -= 90
            }
          })
        }
        this.charging = false
        let q = new Q((new_x + this.x) / 2, (new_y + this.y) / 2, angle, this.q_length)
        this.q_length = 200
        return q
      }
    }

    w(cursor){
      if(this.mana >= 35 && this.w_cooldown <= 0){
        this.mana -= 35
        this.w_cooldown = 180

        let w = new W(cursor.x, cursor.y)
        return w
      }
    }

    e(cursor){
      if(this.mana >= 10 && this.e_cooldown <= 0){
        this.mana -= 10
        this.e_cooldown = 60

        let angle = Math.atan2(cursor.x - this.x, this.y - cursor.y) - Math.PI/2
        let y_vel = 5 * Math.sin(angle)
        let x_vel = 5 * Math.cos(angle)

        let projectile = new Projectile(this.x, this.y, x_vel, y_vel, 70, 15, "skyblue")
        return projectile
      }
    }
    
    update_cooldowns(){
      if (this.q_cooldown > 0){
        this.q_cooldown -= 1
      }
      if (this.w_cooldown > 0){
        this.w_cooldown -= 1
      }
      if (this.e_cooldown > 0){
        this.e_cooldown -= 1
      }

      if(this.q_cooldown < 0){
        this.q_cooldown = 0
      }
      if(this.w_cooldown < 0){
        this.w_cooldown = 0
      }
      if(this.e_cooldown < 0){
        this.e_cooldown = 0
      }
    }

    regen(){
      if (this.health < 100){
        this.health += .05
      }
      if (this.mana < 100){
        this.mana += .1
      }
      if(this.charging && this.q_length < 450){
        this.q_length += 2
      }
    }

    move_to(cursor){
      let angle = Math.atan2(cursor.x - this.x, this.y - cursor.y) - Math.PI/2
      
      if (sqrt((cursor.x - this.x)**2 + (cursor.y - this.y)**2) > this.speed){
        if(this.charging){
          this.y += (this.speed / 2) * Math.sin(angle)
          this.x += (this.speed / 2) * Math.cos(angle)
        }else{
          this.y += this.speed * Math.sin(angle)
          this.x += this.speed * Math.cos(angle)
        }
      }
    }
  
    draw(){
      noStroke()
      fill(0)
      circle(this.x, this.y, this.size)

      if(this.charging){
        let angle = Math.atan2(mouseX - this.x, this.y - mouseY) - Math.PI/2
        let newX = Math.cos(angle) * this.q_length + this.x
        let newY = Math.sin(angle) * this.q_length + this.y

        push()
        noFill()
        stroke("skyblue")
        strokeWeight(5)
        translate((this.x + newX)/2, (this.y + newY)/2)
        rotate(angle);
        rectMode(CENTER)
        rect(0, 0, this.q_length, 100)
        pop()
      }
    }
  }

class W extends Cursor{
  constructor(x, y){
    super(x, y)
    this.size = 200
    this.alpha = 255
    this.approachRadius = 200
  }

  update_state(enemy_list){
    if (this.approachRadius > 0){
      this.approachRadius -= 5
    } else if (this.alpha == 255){
      enemy_list.forEach((enemy) => {
        let dist = sqrt((enemy.x - this.x)**2 + (enemy.y - this.y)**2)
        if (dist < this.size + enemy.size){
          enemy.health -= 110
        }
      })
      this.alpha -= 1
    }else{
      this.alpha -= 5
    }
  }

  draw(){
    if (this.approachRadius > 0){
      stroke("skyblue")
      strokeWeight(5)
      noFill()
      circle(this.x, this.y, this.approachRadius)
    }
    else{
      noStroke()
      fill(135, 206, 235, this.alpha)
      circle(this.x, this.y, this.size)
    }
  }
}

class Q extends Cursor{
  constructor(x, y, angle, length){
    super(x, y)
    this.alpha = 255
    this.angle = angle
    this.length = length
  }

  update_state(){
    this.alpha -= 5
  }

  draw(){
    push()
    fill(135, 206, 235, this.alpha)
    noStroke()
    translate(this.x, this.y)
    rotate(this.angle);
    rectMode(CENTER)
    rect(0, 0, this.length, 100)
    pop()
  }
}

let player, cursor
let enemy_list, projectile_list
let player_projectile_list, w_list, q_list
let damage_alpha
let score, game_over

function setup() {
  createCanvas(1280, 720)
  damage_alpha = 0
  score = 0
  game_over = false
  enemy_list = []
  projectile_list = []
  player_projectile_list = []
  w_list = []
  q_list = []
  cursor = new Cursor(640, 360)
  player = new Player(640, 360)
  frameRate(60)
  
  //Disable ContextMenu and update cursor on right click
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", right_click);
  }
}

function right_click(event){
  cursor.x = mouseX
  cursor.y = mouseY
  event.preventDefault()
}

function draw() {
  background(255)

  if (!game_over){
    if (frameCount % 175 == 0){
      spawn_enemy()
    }
  
    enemy_functions()
    projectile_functions()
    player_functions()
    player_spell_functions()
    draw_resources()
  
    background(255, 0, 0, damage_alpha)
    if (damage_alpha > 0){
      damage_alpha -= 2
    }
  } else {
    fill("black")
    strokeWeight(1)
    textSize(32)
    textAlign(CENTER)
    text("GAME OVER", 640, 300)
    textSize(24)
    strokeWeight(0)
    text("Score: " + score, 640, 360)
    text("Press 'r' to restart", 640, 400)
    textAlign(LEFT)
  }
}

function spawn_enemy(){
  let x
  let y
  choice = random([1, 2, 3, 4])
  if (choice == 1){
    x = random(0, 1280)
    y = -40
  } else if (choice == 2){
    x = 1320
    y = random(0, 720)
  } else if (choice == 3){
    x = random(0, 1280)
    y = 760
  } else if (choice == 4){
    x = -40
    y = random(0, 720)
  }

  let enemy
  choice = random([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  if (choice < 3){
    enemy = new Enemy(x, y, 300, 122, 70, 1, 5, 20, 40, "Maroon", 40)
  } else if(choice < 6){
    enemy = new Enemy(x, y, 200, 67, 50, 2, 7, 15, 20, "IndianRed", 20)
  }else {
    enemy = new Enemy(x, y, 100, 183, 30, 3, 5, 10, 10, "LightCoral", 10)
  }
  enemy_list.push(enemy)
}

function projectile_functions(){
  projectile_list.forEach((projectile) => {
    projectile.draw()
    projectile.update_position()

    if (projectile.x < 0 || projectile.x > 1280 || projectile.y < 0 || projectile.y > 720){
      index = projectile_list.indexOf(projectile)
      if (index > -1) {
        projectile_list.splice(index, 1);
      }
    }

    if(projectile.collided_with(player)){
      player.health -= projectile.damage
      damage_alpha = 80
      index = projectile_list.indexOf(projectile)
      if (index > -1) {
        projectile_list.splice(index, 1);
      }
    }

    if(player.health < 0){
      player.health = 0
    }

    if(player.health == 0){
      game_over = true
    }
  })
}

function enemy_functions(){
  enemy_list.forEach((enemy) => {
    if (enemy.health <= 0){
      score += enemy.points
      index = enemy_list.indexOf(enemy)
      if (index > -1) {
        enemy_list.splice(index, 1);
      }
    }

    enemy.draw()
    enemy.move_to(player)
    enemy.update_cooldowns()

    projectile = enemy.shoot(player)
    if (projectile){
      projectile_list.push(projectile)
    }
  })
}

function player_functions(){
  player.draw()
  player.move_to(cursor)
  player.regen()
  player.update_cooldowns()
}

function player_spell_functions(){
  player_projectile_list.forEach((projectile) => {
    projectile.draw()
    projectile.update_position()

    if (projectile.x < 0 || projectile.x > 1280 || projectile.y < 0 || projectile.y > 720){
      index = projectile_list.indexOf(projectile)
      if (index > -1) {
        projectile_list.splice(index, 1);
      }
    }

    enemy_list.forEach((enemy) => {
      if(projectile.collided_with(enemy)){
        enemy.health -= projectile.damage
        index = player_projectile_list.indexOf(projectile)
        if (index > -1) {
          player_projectile_list.splice(index, 1);
        }
      }
  
      if(player.health < 0){
        player.health = 0
      }
    })
  })

  w_list.forEach((w) => {
    w.update_state(enemy_list)
    w.draw()

    if (w.alpha <= 0){
      index = w_list.indexOf(w)
      if (index > -1) {
        w_list.splice(index, 1);
      }
    }
  })

  q_list.forEach((q) => {
    q.update_state()
    q.draw()

    if (q.alpha <= 0){
      index = q_list.indexOf(q)
      if(index > -1){
        q_list.splice(index, 1)
      }
    }
  })
}

function draw_resources(){
  fill("black")
  strokeWeight(1)
  textSize(32)
  text("Score: " + score, 100, 100)


  stroke(1)
  strokeWeight(5)
  
  fill("grey")
  rect(540, 525, 50, 50)
  rect(640, 525, 50, 50)
  rect(740, 525, 50, 50)
  fill("blue")
  rect(540, 525, 50,  50 * player.q_cooldown/120)
  rect(640, 525, 50,  50 *player.w_cooldown/180)
  rect(740, 525, 50,  50 *player.e_cooldown/60)
  fill("black")
  strokeWeight(1)
  textSize(32)
  text("Q", 551, 559)
  text("W", 650, 559)
  text("E", 754, 559)

  strokeWeight(5)
  fill("grey")
  rect(480, 600, 360, 20)
  fill("red")
  rect(480, 600, 360 * (player.health / 100), 20)
  
  fill("grey")
  rect(480, 650, 360, 20)
  fill("skyblue")
  rect(480, 650, 360 * (player.mana / 100), 20)
}

function keyPressed(){
  if (!game_over){
    if (key == "q"){
      player.q_down()
    }else if (key == "w"){
      w = player.w(new Cursor(mouseX, mouseY))
      if(w){
        w_list.push(w)
      }
    }else if (key == "e"){
       projectile = player.e(new Cursor(mouseX, mouseY))
       if (projectile){
        player_projectile_list.push(projectile)
       }
    }
  } else if (key == "r"){
    cursor.x = 640
    cursor.y = 360
    player.x = 640
    player.y = 360
    player.health = 50
    player.mana = 50
    player.q_cooldown = 0
    player.w_cooldown = 0
    player.e_cooldown = 0
    player.charging = false
    player.q_length = 200
    score = 0
    damage_alpha = 0
    enemy_list = []
    projectile_list = []
    player_projectile_list = []
    q_list = []
    w_list = []
    game_over = false
  }
}

function keyReleased(){
  if(key == 'q'){
    q = player.q_up(enemy_list)
    if (q){
      q_list.push(q)
    }
  }
}

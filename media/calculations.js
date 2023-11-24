function findCircleLineIntersections(r, h, k, m, n) {
    // circle: (x - h)^2 + (y - k)^2 = r^2
    // line: y = m * x + n
    // r: circle radius
    // h: x value of circle centre
    // k: y value of circle centre
    // m: slope
    // n: y-intercept
  
    // get a, b, c values
    var a = 1 + sq(m);
    var b = -h * 2 + (m * (n - k)) * 2;
    var c = sq(h) + sq(n - k) - sq(r);
  
    // get discriminant
    var d = sq(b) - 4 * a * c;
    if (d >= 0) {
        // insert into quadratic formula
        var intersections = [
            (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
            (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a)
        ];
        if (d == 0) {
            // only 1 intersection
            return [intersections[0]];
        }
        return intersections;
    }
    // no intersection
    return [];
  }

function center_in_bound_diagonal(origin_x, origin_y, offset_x, offset_y, target_x, target_y, slope, bound_type){
    if (bound_type == "upper"){
      if(target_y - origin_y - offset_y < (target_x - origin_x - offset_x) * slope){
        return true
      }else{
        return false
      }
    }else{
      if(target_y - origin_y - offset_y > (target_x - origin_x - offset_x) * slope){
        return true
      }else{
        return false
      }
    }
  }

function area_in_bound_diagonal(origin_x, origin_y, offset_x, offset_y, target_x, target_y, radius, slope){
    inbound = false
    for(let x = target_x - radius; x < target_x + radius; x++){
      if(sqrt((x - target_x)**2 + (((x - offset_x - origin_x) * slope) + offset_y + origin_y - target_y) ** 2) < radius){
        inbound = true
        break
      }
    }
    return inbound
}

function check_overlap_diagonal(origin_x, origin_y, long_upper_offset_x, long_upper_offset_y, long_lower_offset_x, long_lower_offset_y, short_lower_offset_x, short_lower_offset_y, short_upper_offset_x, short_upper_offset_y, slope, enemy){
    inbound = true
    if(!center_in_bound_diagonal(origin_x, origin_y, long_upper_offset_x, long_upper_offset_y, enemy.x, enemy.y, slope, "upper")){
        if(!area_in_bound_diagonal(origin_x, origin_y, long_upper_offset_x, long_upper_offset_y, enemy.x, enemy.y, enemy.size/2, slope)){
          inbound = false
       }
      }
      if(!center_in_bound_diagonal(origin_x, origin_y, long_lower_offset_x, long_lower_offset_y, enemy.x, enemy.y, slope, "lower")){
        if(!area_in_bound_diagonal(origin_x, origin_y, long_lower_offset_x, long_lower_offset_y, enemy.x, enemy.y, enemy.size/2, slope)){
          inbound = false
         }
      }
      if(!center_in_bound_diagonal(origin_x, origin_y, short_upper_offset_x, short_upper_offset_y, enemy.x, enemy.y, -1/slope, "upper")){
        if(!area_in_bound_diagonal(origin_x, origin_y, short_upper_offset_x, short_upper_offset_y, enemy.x, enemy.y, enemy.size/2, -1/slope)){
          inbound = false
         }
      }
      if(!center_in_bound_diagonal(origin_x, origin_y, short_lower_offset_x, short_lower_offset_y, enemy.x, enemy.y, -1/slope, "lower")){
        if(!area_in_bound_diagonal(origin_x, origin_y, short_lower_offset_x, short_lower_offset_y, enemy.x, enemy.y, enemy.size/2, -1/slope)){
          inbound = false
         }
      }
      return inbound
}

function area_in_bound_perpendicular(left_bound, right_bound, top_bound, bottom_bound, enemy){
  if(enemy.x + enemy.size/2 > left_bound && enemy.x - enemy.size/2 < right_bound && enemy.y + enemy.size/2 > bottom_bound && enemy.y - enemy.size/2 < top_bound){
    return true
  } else {
    return false
  }
}

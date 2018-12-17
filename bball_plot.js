// Colleen and Dylan

function create_run_plot(parent, width, height, mm_y_metrics, data){
    const margins = {top:10, bottom:50, left:50, right:10};
    const chart_width = width - margins.left - margins.right;
    const chart_height = height - margins.top - margins.bottom;

    let x_metric = 'Year';
    let y_metric = 'R/G';
    let color = "black";
    let opacity = 1;
    let zero_scale = false;
    let dots_toggle = false;


    let all_data = data.slice();
    let data_array = [];
    data_array.push(data);

    let current_data = [];
    let names = [];
    let year_array = [];

    const chart = parent.append("g")
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    const lineLayer = chart.append("g")
      .attr("id", "line-layer");

    const dotLayer = chart.append("g").attr("id", "dot-layer");

    const color_scale = d3.scaleOrdinal(d3.schemeSet2);

    const x_scale = d3.scaleLinear()
        .range([0, chart_width])
        .domain(d3.extent(data, (d)=>+d[x_metric]));

    const y_scale = d3.scaleLinear()
        .range([chart_height, 0])
        .domain([0,mm_y_metrics[y_metric][1]]);

    const x_axis = chart.append("g")
        .attr("transform", `translate(0, ${chart_height})`)
        .call(d3.axisBottom(x_scale).tickFormat(d3.format("d")));

    const y_axis = chart.append("g")
        .call(d3.axisLeft(y_scale));

    const line = d3.line()
        .x((d) => x_scale(+d[x_metric]))
        .y((d) => y_scale(+d[y_metric]));

    const legend = d3.select("#key")
        .append("g");


    chart.append("text")
        .attr("id", "x_label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${chart_width/2}, ${chart_height+ 3*margins.bottom/4})`)
        .text(x_metric);

    chart.append("text")
        .attr("id", "y_label")
        .attr("text-anchor", "middle")
        .attr("transform",`translate(${3*-margins.left/4}, ${chart_height/2})rotate(-90)`)
        .text(y_metric);


    const update_legend = function(){

        let items = legend.selectAll("li")
          .data(names);

        let new_items = items.enter()
          .append("li")
          .text((d)=>d)
          .style("color", (d,i)=>color_scale(i));

        items.exit().remove();

        items = items.merge(new_items);
    }

    const update_year_lines = function(){

      let year_lines = lineLayer.selectAll(".yearLine")
          .data(year_array);

      year_lines.exit().remove();

      let new_year_lines = year_lines.enter()
          .append("line")
          .attr("x1", (d)=> x_scale(d))
          .attr("y1", 0)
          .attr("x2", (d)=> x_scale(d))
          .attr("y2", chart_height)
          .attr("class", "yearLine")
          .style("stroke-width", 2)
          .style("stroke", "#2301a8")
          .style("fill", "none");

      year_lines = year_lines.merge(new_year_lines);

    }

    const update_chart =  function(){

      current_data = data_array.slice(-1)[0];

      if(zero_scale){
        x_scale.domain(d3.extent(current_data, (d)=>+d[x_metric]));
        y_scale.domain(d3.extent(current_data, (d)=>+d[y_metric]));
      }else{
        x_scale.domain(d3.extent(all_data, (d)=>+d[x_metric]));
        y_scale.domain([0,mm_y_metrics[y_metric][1]]);
      }
      x_axis.call(d3.axisBottom(x_scale).tickFormat(d3.format("d")));
      y_axis.call(d3.axisLeft(y_scale));

      update_year_lines();

      update_legend();

        let lines = lineLayer.selectAll(".line")
            .data(data_array);

        lines.exit().remove();

        let new_lines = lines
            .enter()
            .append("path")
            .attr("class","line")
            .attr("d", (d)=>{
              return line(d);
            })
            .style("stroke", (d, i)=>color_scale(i))
            .style("fill","none")
            .style("stroke-width", 3)
            .style("opacity", 1);

        lines = lines.merge(new_lines);


        let circles = dotLayer.selectAll(".circle")
            .data(all_data);

        circles.exit().remove();

        let new_circles = circles
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", (d,i)=> {
              return x_scale(d[x_metric]);
            })
            .attr("cy", (d) => y_scale(d[y_metric]))
            .attr("r", 3)
            .style("fill", "#940de2")
            .style("opacity", 1);

        circles = circles.merge(new_circles);

        if(dots_toggle){
          circles.style("opacity", 1);
        }else{
          circles.style("opacity", 0);
        }

        //Tooltip
        circles.on("mouseover", function(d){

          const coordinates = [d3.event.pageX, d3.event.pageY];
          const info = d3.select("#tooltip");

          d3.select("#tooltip").style("left",`${coordinates[0]}px`);
          d3.select("#tooltip").style("top",`${coordinates[1]}px`);
          d3.select("#tooltip").classed("hidden",false);

          d3.select(this).classed("circle", true);
          info.select("#year").text(d.Year);
          info.select("#RG_metric").text(d['R/G']);
          info.select("#HR_metric").text(d['HR']);
          info.select("#K_metric").text(d['SO']);
          info.select("#BB_metric").text(d['BB']);
        });

        circles.on("mouseout", function(d){
          d3.select(this).classed("highlighted", false);
          d3.select("#tooltip").classed("hidden", true);
        });


        if(y_metric==="BB"){
          d3.select("#y_label").text("Walks Per Game");
        }
        if(y_metric==="R/G"){
          d3.select("#y_label").text("Runs Per Game");
        }
        if(y_metric==="HR"){
          d3.select("#y_label").text("Homeruns Per Game");
        }
        if(y_metric==="SO"){
          d3.select("#y_label").text("Strikeouts Per Game");
        }
        d3.select("#x_label").text(x_metric);


      lines.transition()
        .duration(1000)
        .attr("d", (d)=>{
          return line(d);
      });

      circles.transition()
        .duration(1000)
        .attr("cx",d=>x_scale(d[x_metric]))
        .attr("cy",d=>y_scale(d[y_metric]));



    }

    update_chart.x_metric = (new_x_metric) => {
        if (new_x_metric){
            x_metric = new_x_metric;
            return update_chart;
        }else{
            return x_metric;
        }
    }

    update_chart.y_metric = (new_y_metric) => {
        if (new_y_metric){
            y_metric = new_y_metric;
            return update_chart;
        }else{
            return y_metric;
        }
    }

    update_chart.color = (new_color)=>{
        if (new_color){
            color = new_color;
            return update_chart;
        }else{
            return color;
        }

    }

    update_chart.opacity = (new_opacity)=>{
        if (new_opacity !==undefined){
            opacity = new_opacity;
            return update_chart;
        }else{
            return opacity;
        }

    }

    update_chart.zero_scale = (checked)=>{
        if (checked !==undefined){
            zero_scale = checked;
            return update_chart;
        }else{
            return zero_scale;
        }

    }

    update_chart.dots_toggle = (checked)=>{
        if (checked !==undefined){
            dots_toggle = checked;
            return update_chart;
        }else{
            return dots_toggle;
        }

    }

    update_chart.add_data = (new_data,iter)=>{
      if(new_data){
          let temp_array = new_data[0];
          for(i=1;i<new_data.length;i++){
              temp_array = temp_array.concat(new_data[i]);
          }
          all_data = temp_array.reverse();
          data_array = new_data;
          return update_chart;
      }else{
          return all_data;
      }

    }

    update_chart.add_name = (new_names)=>{
      if(new_names){
          names = new_names;
          return update_chart;
      }else{
          return names;
      }
    }

    update_chart.year_hover = (year) => {
      if(year){
        year_array = [year];
        return update_chart;
      }else{
        year_array = [];
        return update_chart;
      }
    }


    return update_chart;



}

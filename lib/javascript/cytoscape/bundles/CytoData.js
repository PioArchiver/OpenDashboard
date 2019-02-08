// @PioArchiver
// Copyright 2019

(function (){ 
const model = {
  name: null, 
  type: null,
  template: null, 
  layout: null, 
  graphs: [] 
}

class CytoData { 
  constructor(application){ 
    this.app = application;
    
    this.type = application.type;
    
    this.layout = application.layout;
    
    this.graphs = application.graphs;
    
    this.create(model);
    
    
  }
  
  create(mod) {
    let nm = mod.name;
    
    switch(nm) {
      case "type":
      break;
      case "template":
      break;
      case "layout":
      break;
      case "graph":
      break;
    }
    
  }
  
  place(cyto) {
  
  }
  
  remove(cyto) {
  
  }
  
  get name() {
    return model.name; 
  }
  set name(n_data) {
    model.name = n_data;
  }
  
  get type() {
    return model.type;
  }
  set type(type_data) {
    model.type = type_data;
  }
  
  get layout() {
    
    return model.layout;
  }
  set layout(l_data) {
    model.layout = {
      name: l_data.name,
      parts: l_data.parts,
      definition: l_data.definition,
      start: l_data.start
    };
  }
  
  get template() {
    return model.template;
  }
  set template(t_data) {
    model.template = {
      css: t_data.css,
      javascript: t_data.javascript,
      html: t_data.html
    }
  }
  
  get graphs() {
    return model.graph;
  }
  set graphs(g_data) {
    model.graphs = g_data;d    
  }
  
}

})(); 






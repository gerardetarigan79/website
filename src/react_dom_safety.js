const nativeRemoveChild=Node.prototype.removeChild;
Node.prototype.removeChild=function(child){
  if(child&&child.parentNode!==this)return child;
  return nativeRemoveChild.call(this,child);
};

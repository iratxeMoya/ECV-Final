function isHover(e) {
    return (e ? e.parentElement.querySelector(':hover') === e : false);
}


export {
    isHover,
}
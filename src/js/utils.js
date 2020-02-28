function isHover(e) {
    return (e.parentElement.querySelector(':hover') === e);
}


export {
    isHover,
}
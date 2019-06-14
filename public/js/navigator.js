class Navigator
{
	backImg=null
	forwardImg=null
	checkImg=null
	constructor(navElem)
	{
		this.elem=navElem
		this.back=this.elem.querySelector('#back')
		this.home=this.elem.querySelector('#backHome')
		this.fwd=this.elem.querySelector('#forward')
		this.chk=this.elem.querySelector('#check')
		const backEvent=new Event('back')
		const fwdEvent=new Event('fwd')
		const BACK_IMGURL='https://fullstackccu.github.io/final-project/diary-assets/back.png'
		const FWD_IMGURL='https://fullstackccu.github.io/final-project/diary-assets/forward.png'
		const CHK_IMGURL='https://fullstackccu.github.io/final-project/diary-assets/checked.png'
		fetch(BACK_IMGURL).then(response=>response.blob()).then(img=>this.backImg=img).then(()=>this.back.src=URL.createObjectURL(this.backImg)).catch(reason=>console.error('back image:'+reason))
		fetch(FWD_IMGURL).then(response=>response.blob()).then(img=>this.forwardImg=img).then(()=>this.fwd.src=URL.createObjectURL(this.forwardImg)).catch(reason=>console.error('forward image:'+reason))
		fetch(CHK_IMGURL).then(response=>response.blob()).then(img=>this.checkImg=img).then(()=>this.chk.src=URL.createObjectURL(this.checkImg)).catch(reason=>console.error('check image:'+reason))
		const backHome=new Event('tohome')
		this.back.addEventListener('click',()=>document.querySelector('#diary').dispatchEvent(backEvent))
		this.fwd.addEventListener('click',()=>document.querySelector('#diary').dispatchEvent(fwdEvent))
		this.home.addEventListener('click',()=>document.querySelector('#home').dispatchEvent(backHome))
		
	}
	
	
	edit=()=>{
		this.back.classList.add('inactive')
		this.home.classList.add('inactive')
		this.fwd.classList.add('inactive')
		this.chk.classList.remove('inactive')
	}
	view=()=>{
		this.back.classList.remove('inactive')
		this.home.classList.remove('inactive')
		this.fwd.classList.remove('inactive')
		this.chk.classList.add('inactive')
	}
}
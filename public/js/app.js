class App
{
	constructor()
	{
		this.elem=document.querySelector('#home')
		const diaryElem=document.querySelector('#diary')
		this.id=this.getId()
		this.diary=new Diary(diaryElem)
		this.eMsg=document.querySelector('#errorMsg')
		this.resize()
		document.querySelector('#newJournal').addEventListener('click',()=>this.newUser())
		document.querySelector('#findJournal').addEventListener('click',()=>this.oldUser())
		document.querySelector('#viewJournal').addEventListener('click',()=>this.toDiary())
		document.querySelector('#obliterator').addEventListener('click',()=>this.deleteDiary())
		this.elem.addEventListener('tohome',()=>this.toHome())
		if(this.id!==null)
		{
			const getOpt={'method':'GET'}
			fetch('/'+escape(this.id)+'/getid/0',getOpt).then(response=>{return response.json()}).then(json=>{//check valid id
				if(json.error===undefined)
				{
					this.sheetId=json.sheetid
					var expire=new Date()
					expire.setTime(expire.getTime()+(365*86400000))
					document.cookie='id='+this.id+';expires='+expire.toGMTString()
					document.querySelector('#uid').innerText='USER:'+this.id
					this.diary.setId(this.id,this.sheetId)
				}
				else//make cookie expire
				{
					let exp=new Date(0)
					document.cookie='id=;expires='+exp.toUTCString()
					this.eMsg.innerText='ID not found on database,please refresh page'
					this.eMsg.classList.remove('inactive')
				}
			}).catch(()=>console.error('get ids error'))
			fetch('/'+this.id+'/getname/0',getOpt).then(response=>{return response.json()}).then(json=>{
				document.querySelector('#welcomeMsg').innerText='Welcome back '+unescape(json.name)
			}).catch(()=>console.error('get name error'))
			this.elem.querySelector('#newuser').classList.add('inactive')
			this.elem.querySelector('#olduser').classList.remove('inactive')
		}
		window.addEventListener('resize',this.resize)
		console.log('DEMO ID:8c71b2a6-64b6-489b-9f65-6c0bedecb12d')
	}
	
	newUser()
	{
		if(document.querySelector('#uname-input').classList.contains('inactive'))
		{
			document.querySelector('#uname-input').classList.remove('inactive')
			document.querySelector('#newJournal').innerText='CREATE MY JOURNAL!'
		}
		else
		{
			this.id=this.uuid4Gen()
			const name=escape(document.querySelector('#uname-input').value)
			var expire=new Date()
			expire.setTime(expire.getTime()+(365*86400000))
			const opt={'method':'POST','body':'{\"mode\":\"newdiary\",\"name\":\"'+name+'\"}','headers':{'Accept':'application/json','Content-Type':'application/json'}}
			fetch('/'+this.id,opt).then(response=>{return response.json()}).then(json=>{
				this.sheetId=json.sheetid
				this.diary.setId(this.id,this.sheetId)
				document.cookie='id='+this.id+';expires='+expire.toGMTString()
				document.querySelector('#uid').innerText='USER:'+this.id
				this.toDiary()
				document.querySelector('#welcomeMsg').innerText='Welcome '+unescape(name)
				this.elem.querySelector('#newuser').classList.add('inactive')
				this.elem.querySelector('#olduser').classList.remove('inactive')
			}).catch(error=>{
				this.eMsg.innerText='Communication error'
				this.eMsg.classList.remove('inactive')
				return
			})
		}
	}
	oldUser()
	{
		if(document.querySelector('#uid-input').classList.contains('inactive'))
		{
			document.querySelector('#uid-input').classList.remove('inactive')
			document.querySelector('#findJournal').innerText='FIND MY JOURNAL!'
		}
		else
		{
			const old_id=escape(document.querySelector('#uid-input').value)
			if(old_id.length===0)
				return
			const getOpt={'method':'GET'}
			fetch('/'+escape(old_id)+'/getid/0',getOpt).then(response=>{return response.json()}).then(json=>{
				if(json.error===undefined)
				{
					this.id=old_id
					this.sheetId=json.sheetid
					var expire=new Date()
					expire.setTime(expire.getTime()+(365*86400000))
					document.cookie='id='+old_id+';expires='+expire.toGMTString()
					document.querySelector('#uid').innerText='USER:'+old_id
					this.diary.setId(old_id,this.sheetId)
					this.toDiary()
					const name_opt={'method':'GET'}
					fetch('/'+old_id+'/getname/0',name_opt).then(response=>{return response.json()}).then(json=>{
						document.querySelector('#welcomeMsg').innerText='Welcome back '+unescape(json.name)
					}).catch(()=>console.error('get name error'))
					this.elem.querySelector('#newuser').classList.add('inactive')
					this.elem.querySelector('#olduser').classList.remove('inactive')
				}
				else
				{
					this.eMsg.innerText='user id not found'
					this.eMsg.classList.remove('inactive')
				}
			}).catch(()=>console.error('get ids error,from old user'))
		}	
	}
	deleteDiary()
	{
		if(!this.eMsg.classList.contains('warn'))
		{
			this.eMsg.classList.add('warn')
			this.eMsg.innerText='Are you sure you want to delete your journal? This CAN\'T be undone. Press DELETE again to confirm.'
			this.eMsg.classList.remove('inactive')
		}
		else
		{
			const opt={'method':'DELETE'}
			fetch('/'+this.id+'/'+this.sheetId,opt).then(response=>{return response.json()}).then(json=>{
				if(json.error!==undefined)
				{
					this.eMsg.innerText=json.error
					this.eMsg.classList.remove('inactive')
				}
				else
				{
					let exp=new Date(0)
					//document.cookie='id=;expires='+exp.toUTCString()
					this.elem.querySelector('#olduser').classList.add('inactive')
					this.elem.querySelector('#newuser').classList.remove('inactive')
					this.eMsg.classList.add('inactive')
					document.querySelector('#uid').innerText='USER:'
				}
			}).catch(()=>console.error('delete error'))
		}
	}
	toDiary()
	{
		this.hide()
		this.diary.show()
		this.eMsg.innerText=''
		this.eMsg.classList.add('inactive')
		this.eMsg.classList.remove('warn')
	}
	toHome()
	{
		this.show()
		this.diary.hide()
	}
	
	getId()
	{
		let c=document.cookie.split(';')
		for(let i=0,l=c.length;i<l;i++)
		{
			let item=c[i].split('=')
			if(item[0]==='id')
				return item[1]
		}
		return null
	}
	uuid4Gen()
	{
		let t=Date.now()
		if(typeof(performance)!=='undefined'&&typeof(performance.now)===('function'))
			t=performance.now()
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r=(t+Math.random()*16)%16|0
			t=Math.floor(t/16)
			return (c==='x'?r:(r&0x3|0x8)).toString(16)
		})
	}
	
	
	show=()=>this.elem.classList.remove('inactive')
	hide=()=>this.elem.classList.add('inactive')
	resize=()=>{
			const vw=window.innerWidth
			const vh=window.innerHeight
			if(vw<=500)
			{
				this.diary.promptText.style.fontSize='14pt'
				this.diary.textfield.style.width='99vw'
			}
			else if(vw>500&&vw<=800)
			{
				this.diary.promptText.style.fontSize='16pt'
				this.diary.textfield.style.width='80vw'
			}
			else
			{
				this.diary.promptText.style.fontSize='16pt'
				this.diary.textfield.style.width='60vw'
			}
			const titles=document.getElementsByClassName('title')
			const buttons=document.getElementsByClassName('button')
			if(vh<=900)
			{
				for(let i=0;i<titles.length;i++)
				{
					titles[i].style.marginTop='5vh'
					titles[i].style.fontSize='20pt'
				}
				for(let i=0;i<buttons.length;i++)
					buttons[i].style.fontSize='10pt'
				this.eMsg.style.fontSize='0.8em'
			}
			else
			{
				for(let i=0;i<titles.length;i++)
				{
					titles[i].style.marginTop='10vh'
					titles[i].style.fontSize='30pt'
					buttons[i].style.fontSize='16pt'
				}
				for(let i=0;i<buttons.length;i++)
					buttons[i].style.fontSize='16pt'
				this.eMsg.style.fontSize='1em'
			}
		}
}
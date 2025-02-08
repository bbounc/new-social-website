import Notification from "../models/notification.model.js";


export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg politicalAffiliation",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotification = async( req,res)=>{

	try{ 
const userId = req.user._id;
const notficationId = req.params.id;
const notification = await Notification.findById(notficationId);

if(!notification){
	return res.status(400).json({error: "Notification not found"})
}
if(notification.to.toString() !== userId.toString()){
	return res.status(403).json({error:"You are not authorized"})
}
await Notification.findByIdAndDelete(notficationId);
res.status(200).json({message: "Notification deleted"})
	}
	catch(error){
console.log ("Error in notification function")
res.status(500).json({error: "Internal Servor error"})
	}
}
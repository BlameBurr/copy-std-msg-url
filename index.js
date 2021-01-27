const { Plugin } = require("powercord/entities");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

module.exports = class ViewRaw extends (Plugin) {
	startPlugin() {
		this.addButtons();
	}

	pluginWillUnload() {
		this.addButtons(true, true);
		document
			.querySelectorAll(".copy-link-button")
			.forEach((e) => (e.style.display = "none"));
	}

	async addButtons(repatch, unpatch) {
		if (repatch) {
			uninject("copy-link-contextmenu");
		}
		if (unpatch) return;
		const { clipboard } = await getModule(["clipboard"]);
		const { MenuGroup, MenuItem } = await getModule(["MenuGroup", "MenuItem"]);
		const MessageContextMenu = await getModule(
			(m) => m?.default?.displayName === "MessageContextMenu"
		);

		inject(
			"copy-link-contextmenu",
			MessageContextMenu,
			"default",
			(args, res) => {
				if (!args[0]?.message) return res;
				let message = args[0].message;
				let msgID = message.id;
				let channelID = message.channel_id;

				let guildID = [0, 4, 5].includes(args[0].channel.type) ? args[0].channel.guild_id : '@me';
				let url = `https://discord.com/channels/${guildID}/${channelID}/${msgID}`;
				
				res.props.children.splice(
					4,
					0,
					React.createElement(MenuItem, {
						action: () => clipboard.copy(url),
						disabled: !args[0].message,
						id: "copy-message-link",
						label: "Copy Normal Message Link",
					})
				);
				return res;
			}
		);
		MessageContextMenu.default.displayName = "MessageContextMenu";
	}
};

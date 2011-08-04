module ApplicationHelper
  def current_user_session
    output = { 
      :authenticated => signed_in?,
      :stickies => Board.sort("stickies").count,
      :boards => Board.count
    }
    output.merge!(current_user.serializable_hash) if signed_in?
    output.to_json.html_safe
  end
end
